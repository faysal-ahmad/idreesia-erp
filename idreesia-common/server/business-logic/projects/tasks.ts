import {
  OpenTaskStatuses,
  ProjectsAction,
  ProjectsEntityType,
  TaskPriority,
  TaskStatus,
  type ProjectsActionValue,
  type TaskPriorityValue,
  type TaskStatusValue,
} from 'meteor/idreesia-common/constants/projects';
import {
  ProjectComments,
  ProjectTasks,
  type ProjectDocument,
  type ProjectsMetadata,
  type ProjectTaskDocument,
} from 'meteor/idreesia-common/server/collections/projects';

import { logActivity } from './activity';
import {
  notifyTaskAssigned,
  notifyTaskDeleted,
  notifyTaskDueDateChanged,
  notifyTaskPriorityChanged,
  notifyTaskStatusChanged,
  notifyTaskUnassigned,
} from './notifications';
import { projectsError } from './errors';
import {
  assertProjectOpen,
  liveWorkspaceSelector,
  METADATA_KEY_PATTERN,
  normalizeOpaqueId,
  normalizePage,
  normalizeTags,
  normalizeText,
  normalizeTitle,
  refreshProjectStats,
  requireOneOf,
  requireProject,
  requireTask,
  requireUserId,
  requireWorkspace,
  toDate,
  validateMetadata,
  writeTask,
  type ProjectsPage,
  type ProjectsPageOptions,
  type ProjectsSortOrder,
} from './internal';

const logTask = (
  task: Pick<ProjectTaskDocument, '_id' | 'workspaceId' | 'projectId'>,
  action: ProjectsActionValue,
  userId: string,
  details?: Record<string, unknown>
) =>
  logActivity({
    workspaceId: task.workspaceId,
    ...(task.projectId ? { projectId: task.projectId } : {}),
    taskId: task._id,
    entityType: ProjectsEntityType.TASK,
    entityId: task._id,
    action,
    userId,
    ...(details ? { details } : {}),
  });

/** A task is overdue when it has a due date in the past and is still open. */
export const isTaskOverdue = (
  task: Pick<ProjectTaskDocument, 'dueDate' | 'status'>,
  now: Date = new Date()
) =>
  !!task.dueDate &&
  task.dueDate.getTime() < now.getTime() &&
  OpenTaskStatuses.includes(task.status);

/** The project a task belongs to, which must be open. */
async function requireOpenTaskProject(
  workspaceId: string,
  projectId: string
): Promise<ProjectDocument> {
  const project = await requireProject(projectId, { workspaceId });
  assertProjectOpen(project);
  return project;
}

/** A task in a project can only be assigned to one of its participants. */
function assertParticipant(project: ProjectDocument, assigneeId: string) {
  if (!project.participantIds.includes(assigneeId)) {
    throw projectsError(
      'CONFLICT',
      'The assignee is not a participant of the project; add them first',
      { assigneeId }
    );
  }
}

const normalizeProgress = (value: unknown) => {
  if (
    typeof value !== 'number' ||
    !Number.isInteger(value) ||
    value < 0 ||
    value > 100
  ) {
    throw projectsError(
      'BAD_USER_INPUT',
      'Progress must be a whole number from 0 to 100'
    );
  }
  return value;
};

export interface CreateTaskInput {
  workspaceId: string;
  /** Unset: a standalone task. */
  projectId?: string;
  title: string;
  description?: string;
  /** One assignee only. For a project task, must be a participant. */
  assigneeId?: string;
  dueDate?: Date | string | number;
  /** Default `normal`. */
  priority?: TaskPriorityValue;
  tags?: string[];
  metadata?: ProjectsMetadata;
}

/** Creates a task, standalone or in an open project. It starts as `todo`. */
export async function createTask(
  input: CreateTaskInput,
  userId: string
): Promise<ProjectTaskDocument> {
  requireUserId(userId);
  const workspace = await requireWorkspace(input.workspaceId);
  const project = input.projectId
    ? await requireOpenTaskProject(workspace._id, input.projectId)
    : undefined;
  const title = normalizeTitle(input.title, 'Task title');
  const description = normalizeText(input.description, 'Description');
  const metadata = validateMetadata(input.metadata);
  const assigneeId = input.assigneeId
    ? normalizeOpaqueId(input.assigneeId, 'Assignee id')
    : undefined;
  if (project && assigneeId) assertParticipant(project, assigneeId);
  const dueDate =
    input.dueDate === undefined || input.dueDate === null
      ? undefined
      : toDate(input.dueDate, 'Due date');
  const priority =
    input.priority === undefined
      ? TaskPriority.NORMAL
      : requireOneOf(input.priority, TaskPriority, 'Priority');

  const date = new Date();
  const taskId = await ProjectTasks.insertAsync({
    workspaceId: workspace._id,
    ...(project ? { projectId: project._id } : {}),
    title,
    ...(description ? { description } : {}),
    ...(assigneeId ? { assigneeId } : {}),
    ...(dueDate ? { dueDate } : {}),
    status: TaskStatus.TODO,
    priority,
    progress: 0,
    tags: normalizeTags(input.tags),
    ...(metadata ? { metadata } : {}),
    commentCount: 0,
    revision: 0,
    createdAt: date,
    createdBy: userId,
    updatedAt: date,
    updatedBy: userId,
  });

  if (project) await refreshProjectStats(project._id);
  const task = await requireTask(taskId);
  await logTask(task, ProjectsAction.TASK_CREATED, userId, {
    title,
    ...(assigneeId ? { assigneeId } : {}),
  });
  await notifyTaskAssigned(task, userId);
  return task;
}

export async function getTask(
  taskId: string,
  userId: string
): Promise<ProjectTaskDocument> {
  requireUserId(userId);
  return requireTask(taskId);
}

/** Loads a task and, if it is in a project, checks that project is open. */
async function requireEditableTask(taskId: string) {
  const task = await requireTask(taskId);
  const project = task.projectId
    ? await requireProject(task.projectId)
    : undefined;
  if (project) assertProjectOpen(project);
  return { task, project };
}

export interface UpdateTaskInput {
  title?: string;
  /** null clears it. */
  description?: string | null;
  /** null unassigns. For a project task, must be a participant. */
  assigneeId?: string | null;
  dueDate?: Date | string | number | null;
  priority?: TaskPriorityValue;
  tags?: string[];
  /** Replaces the whole object; null clears it. */
  metadata?: ProjectsMetadata | null;
}

/**
 * Changes a task's details, including its assignee and due date. Use
 * `setTaskStatus` and `setTaskProgress` for the rest.
 */
export async function updateTask(
  taskId: string,
  changes: UpdateTaskInput,
  userId: string
): Promise<ProjectTaskDocument> {
  requireUserId(userId);
  const { task, project } = await requireEditableTask(taskId);

  const $set: Record<string, unknown> = {};
  const $unset: Record<string, 1> = {};
  let assigneeChanged = false;

  if (changes.title !== undefined) {
    $set.title = normalizeTitle(changes.title, 'Task title');
  }
  if (changes.description !== undefined) {
    const description = normalizeText(changes.description, 'Description');
    if (description) $set.description = description;
    else $unset.description = 1;
  }
  if (changes.assigneeId !== undefined) {
    if (changes.assigneeId === null || changes.assigneeId === '') {
      assigneeChanged = !!task.assigneeId;
      $unset.assigneeId = 1;
    } else {
      const assigneeId = normalizeOpaqueId(changes.assigneeId, 'Assignee id');
      if (project) assertParticipant(project, assigneeId);
      assigneeChanged = assigneeId !== task.assigneeId;
      $set.assigneeId = assigneeId;
    }
  }
  if (changes.dueDate !== undefined) {
    if (changes.dueDate === null) $unset.dueDate = 1;
    else $set.dueDate = toDate(changes.dueDate, 'Due date');
  }
  if (changes.priority !== undefined) {
    $set.priority = requireOneOf(changes.priority, TaskPriority, 'Priority');
  }
  if (changes.tags !== undefined) $set.tags = normalizeTags(changes.tags);
  if (changes.metadata !== undefined) {
    const metadata = validateMetadata(changes.metadata);
    if (metadata) $set.metadata = metadata;
    else $unset.metadata = 1;
  }

  const updated = await writeTask(task, userId, { $set, $unset });
  const changed = Object.keys(changes).filter(
    key => changes[key as keyof UpdateTaskInput] !== undefined
  );
  await logTask(task, ProjectsAction.TASK_UPDATED, userId, { changed });
  if (assigneeChanged) {
    await logTask(task, ProjectsAction.TASK_ASSIGNED, userId, {
      from: task.assigneeId ?? null,
      to: updated.assigneeId ?? null,
    });
    if (task.assigneeId) {
      await notifyTaskUnassigned(updated, task.assigneeId, userId);
    }
    await notifyTaskAssigned(updated, userId);
  }
  if (task.dueDate?.getTime() !== updated.dueDate?.getTime()) {
    await notifyTaskDueDateChanged(updated, updated.dueDate, userId);
  }
  if (updated.priority !== task.priority) {
    await notifyTaskPriorityChanged(updated, updated.priority, userId);
  }
  return updated;
}

/**
 * Moves a task to another status. `done` sets progress to 100 and records who
 * completed it. Leaving `done` clears that, and resets progress to 0 for
 * `todo` (otherwise it is at most 99).
 */
export async function setTaskStatus(
  taskId: string,
  status: TaskStatusValue,
  userId: string
): Promise<ProjectTaskDocument> {
  requireUserId(userId);
  const next = requireOneOf(status, TaskStatus, 'Status');
  const { task } = await requireEditableTask(taskId);
  if (task.status === next) return task;

  const $set: Record<string, unknown> = { status: next };
  const $unset: Record<string, 1> = {};
  if (next === TaskStatus.DONE) {
    $set.progress = 100;
    $set.completedAt = new Date();
    $set.completedBy = userId;
  } else if (task.status === TaskStatus.DONE) {
    $unset.completedAt = 1;
    $unset.completedBy = 1;
    $set.progress = next === TaskStatus.TODO ? 0 : Math.min(task.progress, 99);
  }

  const updated = await writeTask(task, userId, { $set, $unset });
  if (task.projectId) await refreshProjectStats(task.projectId);
  await logTask(task, ProjectsAction.TASK_STATUS_CHANGED, userId, {
    from: task.status,
    to: next,
  });
  await notifyTaskStatusChanged(updated, updated.status, userId);
  return updated;
}

/**
 * Sets a task's progress (0-100) while it is open. Reaching 100 completes the
 * task; progress above 0 on a `todo` task starts it.
 */
export async function setTaskProgress(
  taskId: string,
  progress: number,
  userId: string
): Promise<ProjectTaskDocument> {
  requireUserId(userId);
  const value = normalizeProgress(progress);
  const { task } = await requireEditableTask(taskId);
  if (!OpenTaskStatuses.includes(task.status)) {
    throw projectsError(
      'CONFLICT',
      `Progress can't be set on a ${task.status} task`,
      { status: task.status }
    );
  }

  const $set: Record<string, unknown> = { progress: value };
  if (value === 100) {
    $set.status = TaskStatus.DONE;
    $set.completedAt = new Date();
    $set.completedBy = userId;
  } else if (value > 0 && task.status === TaskStatus.TODO) {
    $set.status = TaskStatus.IN_PROGRESS;
  }

  const updated = await writeTask(task, userId, { $set });
  if (task.projectId) await refreshProjectStats(task.projectId);
  await logTask(task, ProjectsAction.TASK_PROGRESS_CHANGED, userId, {
    from: task.progress,
    to: value,
  });
  if (updated.status !== task.status) {
    await logTask(task, ProjectsAction.TASK_STATUS_CHANGED, userId, {
      from: task.status,
      to: updated.status,
    });
    await notifyTaskStatusChanged(updated, updated.status, userId);
  }
  return updated;
}

/** Permanently deletes a task and its comments. Its activity is kept. */
export async function deleteTask(
  taskId: string,
  userId: string
): Promise<void> {
  requireUserId(userId);
  const task = await requireTask(taskId);
  await ProjectComments.removeAsync({ taskId });
  await ProjectTasks.removeAsync(taskId);
  if (task.projectId) await refreshProjectStats(task.projectId);
  await logTask(task, ProjectsAction.TASK_DELETED, userId, {
    title: task.title,
  });
  await notifyTaskDeleted(task, userId);
}

interface TaskFilterOptions {
  /** One status or a list. */
  status?: TaskStatusValue | TaskStatusValue[];
  priority?: TaskPriorityValue | TaskPriorityValue[];
  /** Only open tasks whose due date has passed. */
  overdue?: boolean;
  /** Due after / before these times. */
  dueAfter?: Date;
  dueBefore?: Date;
  /** Tasks that have all of these tags. */
  tags?: string[];
  /** `{ key: value }`: exact match on top-level metadata values. */
  metadata?: Record<string, unknown>;
  /** Default `dueDate` (tasks without one last). */
  sortBy?: 'dueDate' | 'createdAt' | 'priority' | 'title';
  /** Default `asc` (`desc` for `createdAt`). */
  sortOrder?: ProjectsSortOrder;
}

export interface ListTasksOptions extends TaskFilterOptions, ProjectsPageOptions {
  /** Only this project's tasks. */
  projectId?: string;
  /** true: only standalone tasks (ignored with `projectId`). */
  standalone?: boolean;
  /** Only tasks assigned to this person. */
  assigneeId?: string;
  /** true: only tasks nobody is assigned to. */
  unassigned?: boolean;
  /** Whole words in title, description and tags. */
  text?: string;
}

const PRIORITY_RANK: Record<TaskPriorityValue, number> = {
  [TaskPriority.LOW]: 0,
  [TaskPriority.NORMAL]: 1,
  [TaskPriority.HIGH]: 2,
  [TaskPriority.URGENT]: 3,
};

function buildFilter({
  status,
  priority,
  overdue,
  dueAfter,
  dueBefore,
  tags,
  metadata,
}: TaskFilterOptions): Record<string, unknown> {
  const selector: Record<string, unknown> = {};
  const listOf = <T>(value: T | T[]) => (Array.isArray(value) ? value : [value]);

  let statuses: TaskStatusValue[] | undefined;
  if (status !== undefined) {
    statuses = listOf(status).map(value =>
      requireOneOf(value, TaskStatus, 'Status')
    );
  }
  if (overdue) {
    statuses = (statuses ?? OpenTaskStatuses).filter(value =>
      OpenTaskStatuses.includes(value)
    );
  }
  if (statuses) selector.status = { $in: statuses };
  if (priority !== undefined) {
    selector.priority = {
      $in: listOf(priority).map(value =>
        requireOneOf(value, TaskPriority, 'Priority')
      ),
    };
  }
  if (overdue || dueAfter || dueBefore) {
    const before = dueBefore ? toDate(dueBefore, 'dueBefore') : undefined;
    const limit = overdue
      ? new Date(Math.min(before?.getTime() ?? Infinity, Date.now()))
      : before;
    selector.dueDate = {
      ...(dueAfter ? { $gt: toDate(dueAfter, 'dueAfter') } : {}),
      ...(limit ? { $lt: limit } : {}),
    };
  }
  const normalizedTags = normalizeTags(tags);
  if (normalizedTags.length) selector.tags = { $all: normalizedTags };
  Object.entries(metadata ?? {}).forEach(([key, value]) => {
    if (!METADATA_KEY_PATTERN.test(key)) {
      throw projectsError('BAD_USER_INPUT', `Invalid metadata key "${key}"`);
    }
    selector[`metadata.${key}`] = value;
  });
  return selector;
}

async function findTasks(
  selector: Record<string, unknown>,
  { sortBy = 'dueDate', sortOrder }: TaskFilterOptions,
  page: ProjectsPageOptions
): Promise<ProjectsPage<ProjectTaskDocument>> {
  const { skip, limit } = normalizePage(page);
  const direction =
    (sortOrder ?? (sortBy === 'createdAt' ? 'desc' : 'asc')) === 'desc' ? -1 : 1;

  let data: ProjectTaskDocument[];
  if (sortBy === 'priority' || sortBy === 'dueDate') {
    // Priority is a word, and a missing due date would sort first, so these
    // sort on a computed key; tasks without a due date always come last.
    const key =
      sortBy === 'priority'
        ? {
            $switch: {
              branches: Object.entries(PRIORITY_RANK).map(([name, rank]) => ({
                case: { $eq: ['$priority', name] },
                then: rank,
              })),
              default: 1,
            },
          }
        : { $cond: [{ $ifNull: ['$dueDate', false] }, 0, 1] };
    data = await ProjectTasks.rawCollection()
      .aggregate<ProjectTaskDocument>([
        { $match: selector },
        { $addFields: { sortKey: key } },
        {
          $sort:
            sortBy === 'priority'
              ? { sortKey: direction, dueDate: 1, _id: 1 }
              : { sortKey: 1, dueDate: direction, _id: 1 },
        },
        { $skip: skip },
        { $limit: limit },
        { $project: { sortKey: 0 } },
      ])
      .toArray();
  } else {
    data = await ProjectTasks.find(selector, {
      sort: { [sortBy]: direction, _id: direction },
      skip,
      limit,
    }).fetchAsync();
  }
  const totalResults = await ProjectTasks.find(selector).countAsync();
  return { data, totalResults };
}

/** A workspace's tasks, standalone and in projects. */
export async function listTasks(
  workspaceId: string,
  userId: string,
  {
    projectId,
    standalone,
    assigneeId,
    unassigned,
    text,
    status,
    priority,
    overdue,
    dueAfter,
    dueBefore,
    tags,
    metadata,
    sortBy,
    sortOrder,
    ...page
  }: ListTasksOptions = {}
): Promise<ProjectsPage<ProjectTaskDocument>> {
  requireUserId(userId);
  await requireWorkspace(workspaceId);

  const selector: Record<string, unknown> = {
    workspaceId,
    ...buildFilter({
      status,
      priority,
      overdue,
      dueAfter,
      dueBefore,
      tags,
      metadata,
    }),
  };
  if (projectId) selector.projectId = projectId;
  else if (standalone) selector.projectId = { $exists: false };
  if (assigneeId) {
    selector.assigneeId = normalizeOpaqueId(assigneeId, 'Assignee id');
  } else if (unassigned) {
    selector.assigneeId = { $exists: false };
  }
  if (text?.trim()) selector.$text = { $search: text.trim() };
  return findTasks(selector, { sortBy, sortOrder }, page);
}

export interface ListAssigneeTasksOptions
  extends TaskFilterOptions,
    ProjectsPageOptions {
  /** Only tasks in these workspaces - the ones the caller authorised. */
  workspaceIds?: string[];
}

/**
 * The tasks assigned to a person, across workspaces ("my tasks"). Defaults
 * to open tasks.
 */
export async function listAssigneeTasks(
  assigneeId: string,
  userId: string,
  {
    workspaceIds,
    status = OpenTaskStatuses,
    priority,
    overdue,
    dueAfter,
    dueBefore,
    tags,
    metadata,
    sortBy,
    sortOrder,
    ...page
  }: ListAssigneeTasksOptions = {}
): Promise<ProjectsPage<ProjectTaskDocument>> {
  requireUserId(userId);
  const id = normalizeOpaqueId(assigneeId, 'Assignee id');
  const selector: Record<string, unknown> = {
    workspaceId: await liveWorkspaceSelector(workspaceIds),
    assigneeId: id,
    ...buildFilter({
      status,
      priority,
      overdue,
      dueAfter,
      dueBefore,
      tags,
      metadata,
    }),
  };
  return findTasks(selector, { sortBy, sortOrder }, page);
}
