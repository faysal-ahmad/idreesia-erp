import {
  OpenTaskStatuses,
  ProjectsAction,
  ProjectsEntityType,
  ProjectStatus,
  type ProjectsActionValue,
  type ProjectStatusValue,
} from 'meteor/idreesia-common/constants/projects';
import {
  ProjectComments,
  Projects,
  ProjectTasks,
  type ProjectDocument,
  type ProjectsMetadata,
} from 'meteor/idreesia-common/server/collections/projects';

import { logActivity } from './activity';
import { projectsError } from './errors';
import {
  liveWorkspaceSelector,
  METADATA_KEY_PATTERN,
  normalizeIdList,
  normalizeOpaqueId,
  normalizePage,
  normalizeTags,
  normalizeText,
  normalizeTitle,
  requireOneOf,
  requireProject,
  requireUserId,
  requireWorkspace,
  toDate,
  validateMetadata,
  writeProject,
  type ProjectsPage,
  type ProjectsPageOptions,
  type ProjectsSortOrder,
} from './internal';

const logProject = (
  project: Pick<ProjectDocument, '_id' | 'workspaceId'>,
  action: ProjectsActionValue,
  userId: string,
  details?: Record<string, unknown>
) =>
  logActivity({
    workspaceId: project.workspaceId,
    projectId: project._id,
    entityType: ProjectsEntityType.PROJECT,
    entityId: project._id,
    action,
    userId,
    ...(details ? { details } : {}),
  });

const optionalDate = (value: unknown, what: string) =>
  value === undefined || value === null ? undefined : toDate(value, what);

function assertDateOrder(startDate?: Date, targetDate?: Date) {
  if (startDate && targetDate && targetDate.getTime() < startDate.getTime()) {
    throw projectsError(
      'BAD_USER_INPUT',
      'The target date must not be before the start date'
    );
  }
}

export interface CreateProjectInput {
  workspaceId: string;
  title: string;
  /** What the project is meant to achieve. */
  objective?: string;
  description?: string;
  /** Default `active`. */
  status?: ProjectStatusValue;
  /** Opaque ids of the people working on the project. */
  participantIds?: string[];
  startDate?: Date | string | number;
  targetDate?: Date | string | number;
  tags?: string[];
  metadata?: ProjectsMetadata;
}

export async function createProject(
  input: CreateProjectInput,
  userId: string
): Promise<ProjectDocument> {
  requireUserId(userId);
  const workspace = await requireWorkspace(input.workspaceId);
  const title = normalizeTitle(input.title, 'Project title');
  const objective = normalizeText(input.objective, 'Objective');
  const description = normalizeText(input.description, 'Description');
  const metadata = validateMetadata(input.metadata);
  const status =
    input.status === undefined
      ? ProjectStatus.ACTIVE
      : requireOneOf(input.status, ProjectStatus, 'Status');
  if (
    status === ProjectStatus.COMPLETED ||
    status === ProjectStatus.CANCELLED
  ) {
    throw projectsError(
      'BAD_USER_INPUT',
      'A new project cannot start out completed or cancelled'
    );
  }
  const participantIds = normalizeIdList(input.participantIds ?? []);
  const startDate = optionalDate(input.startDate, 'Start date');
  const targetDate = optionalDate(input.targetDate, 'Target date');
  assertDateOrder(startDate, targetDate);

  const date = new Date();
  const projectId = await Projects.insertAsync({
    workspaceId: workspace._id,
    title,
    ...(objective ? { objective } : {}),
    ...(description ? { description } : {}),
    status,
    participantIds,
    ...(startDate ? { startDate } : {}),
    ...(targetDate ? { targetDate } : {}),
    tags: normalizeTags(input.tags),
    ...(metadata ? { metadata } : {}),
    taskCount: 0,
    doneCount: 0,
    progress: 0,
    revision: 0,
    createdAt: date,
    createdBy: userId,
    updatedAt: date,
    updatedBy: userId,
  });

  const project = await requireProject(projectId);
  await logProject(project, ProjectsAction.PROJECT_CREATED, userId, { title });
  return project;
}

export async function getProject(
  projectId: string,
  userId: string
): Promise<ProjectDocument> {
  requireUserId(userId);
  return requireProject(projectId);
}

export interface UpdateProjectInput {
  title?: string;
  /** null clears it. */
  objective?: string | null;
  description?: string | null;
  startDate?: Date | string | number | null;
  targetDate?: Date | string | number | null;
  tags?: string[];
  /** Replaces the whole object; null clears it. */
  metadata?: ProjectsMetadata | null;
}

/** Changes a project's details. Use `setProjectStatus` to change its status. */
export async function updateProject(
  projectId: string,
  changes: UpdateProjectInput,
  userId: string
): Promise<ProjectDocument> {
  requireUserId(userId);
  const project = await requireProject(projectId);

  const $set: Record<string, unknown> = {};
  const $unset: Record<string, 1> = {};

  if (changes.title !== undefined) {
    $set.title = normalizeTitle(changes.title, 'Project title');
  }
  (['objective', 'description'] as const).forEach(field => {
    if (changes[field] === undefined) return;
    const value = normalizeText(
      changes[field],
      field === 'objective' ? 'Objective' : 'Description'
    );
    if (value) $set[field] = value;
    else $unset[field] = 1;
  });
  const startDate =
    changes.startDate === undefined
      ? project.startDate
      : optionalDate(changes.startDate, 'Start date');
  const targetDate =
    changes.targetDate === undefined
      ? project.targetDate
      : optionalDate(changes.targetDate, 'Target date');
  assertDateOrder(startDate, targetDate);
  if (changes.startDate !== undefined) {
    if (startDate) $set.startDate = startDate;
    else $unset.startDate = 1;
  }
  if (changes.targetDate !== undefined) {
    if (targetDate) $set.targetDate = targetDate;
    else $unset.targetDate = 1;
  }
  if (changes.tags !== undefined) $set.tags = normalizeTags(changes.tags);
  if (changes.metadata !== undefined) {
    const metadata = validateMetadata(changes.metadata);
    if (metadata) $set.metadata = metadata;
    else $unset.metadata = 1;
  }

  const updated = await writeProject(project, userId, { $set, $unset });
  const changed = Object.keys(changes).filter(
    key => changes[key as keyof UpdateProjectInput] !== undefined
  );
  await logProject(project, ProjectsAction.PROJECT_UPDATED, userId, {
    changed,
  });
  return updated;
}

export interface SetProjectStatusOptions {
  /** Complete the project even though some tasks are still open. */
  force?: boolean;
}

/**
 * Moves a project to another status. Completing a project with open tasks
 * fails with CONFLICT unless `force` is set. Leaving `completed` clears the
 * completion fields.
 */
export async function setProjectStatus(
  projectId: string,
  status: ProjectStatusValue,
  userId: string,
  { force = false }: SetProjectStatusOptions = {}
): Promise<ProjectDocument> {
  requireUserId(userId);
  const next = requireOneOf(status, ProjectStatus, 'Status');
  const project = await requireProject(projectId);
  if (project.status === next) return project;

  if (next === ProjectStatus.COMPLETED && !force) {
    const open = await ProjectTasks.find({
      projectId,
      status: { $in: OpenTaskStatuses },
    }).countAsync();
    if (open > 0) {
      throw projectsError(
        'CONFLICT',
        `${open} task${open === 1 ? ' is' : 's are'} still open`,
        { openTasks: open }
      );
    }
  }

  const $set: Record<string, unknown> = { status: next };
  const $unset: Record<string, 1> = {};
  if (next === ProjectStatus.COMPLETED) {
    $set.completedAt = new Date();
    $set.completedBy = userId;
  } else {
    $unset.completedAt = 1;
    $unset.completedBy = 1;
  }
  const updated = await writeProject(project, userId, { $set, $unset });
  await logProject(project, ProjectsAction.PROJECT_STATUS_CHANGED, userId, {
    from: project.status,
    to: next,
  });
  return updated;
}

/** Adds people to the project. Already-listed ids are ignored. */
export async function addProjectParticipants(
  projectId: string,
  participantIds: string[],
  userId: string
): Promise<ProjectDocument> {
  requireUserId(userId);
  const project = await requireProject(projectId);
  const ids = normalizeIdList(participantIds);
  const current = new Set(project.participantIds);
  const added = ids.filter(id => !current.has(id));
  if (!added.length) return project;

  const updated = await writeProject(project, userId, {
    $set: {
      participantIds: normalizeIdList([...project.participantIds, ...added]),
    },
  });
  await logProject(project, ProjectsAction.PARTICIPANTS_ADDED, userId, {
    participantIds: added,
  });
  return updated;
}

export interface RemoveProjectParticipantOptions {
  /** Unassign the participant's open tasks in the project. */
  unassignTasks?: boolean;
}

/**
 * Removes a participant. Fails with CONFLICT if the participant has open
 * tasks in the project, unless `unassignTasks` is set.
 */
export async function removeProjectParticipant(
  projectId: string,
  participantId: string,
  userId: string,
  { unassignTasks = false }: RemoveProjectParticipantOptions = {}
): Promise<ProjectDocument> {
  requireUserId(userId);
  const id = normalizeOpaqueId(participantId, 'Participant id');
  const project = await requireProject(projectId);
  if (!project.participantIds.includes(id)) return project;
  const taskSelector = {
    projectId,
    assigneeId: id,
    status: { $in: OpenTaskStatuses },
  };
  const openTasks = await ProjectTasks.find(taskSelector).countAsync();
  if (openTasks > 0) {
    if (!unassignTasks) {
      throw projectsError(
        'CONFLICT',
        'This person still has open tasks in the project',
        { openTasks }
      );
    }
    await ProjectTasks.updateAsync(
      taskSelector,
      {
        $unset: { assigneeId: 1 },
        $set: { updatedAt: new Date(), updatedBy: userId },
        $inc: { revision: 1 },
      },
      { multi: true }
    );
  }

  const updated = await writeProject(project, userId, {
    $set: {
      participantIds: project.participantIds.filter(value => value !== id),
    },
  });
  await logProject(project, ProjectsAction.PARTICIPANT_REMOVED, userId, {
    participantId: id,
  });
  return updated;
}

/**
 * Stores the opaque id of the project's chat group. The module never uses
 * it; the consuming feature owns the group. null clears it.
 */
export async function setProjectChatGroupId(
  projectId: string,
  chatGroupId: string | null,
  userId: string
): Promise<ProjectDocument> {
  requireUserId(userId);
  const project = await requireProject(projectId);
  const id = chatGroupId ? normalizeOpaqueId(chatGroupId, 'Chat group id') : null;
  return writeProject(
    project,
    userId,
    id ? { $set: { chatGroupId: id } } : { $unset: { chatGroupId: 1 } },
    { checkRevision: false }
  );
}

export interface DeleteProjectOptions {
  /**
   * What happens to the project's tasks: `detach` (default) keeps them as
   * standalone tasks, `delete` removes them with their comments.
   */
  tasks?: 'detach' | 'delete';
}

/** Permanently deletes a project. Its activity entries are kept. */
export async function deleteProject(
  projectId: string,
  userId: string,
  { tasks = 'detach' }: DeleteProjectOptions = {}
): Promise<void> {
  requireUserId(userId);
  if (tasks !== 'detach' && tasks !== 'delete') {
    throw projectsError('BAD_USER_INPUT', 'tasks must be detach or delete');
  }
  const project = await requireProject(projectId);

  if (tasks === 'delete') {
    const taskIds = (
      await ProjectTasks.find({ projectId }, { fields: { _id: 1 } }).fetchAsync()
    ).map(({ _id }) => _id);
    await ProjectComments.removeAsync({ taskId: { $in: taskIds } });
    await ProjectTasks.removeAsync({ projectId });
  } else {
    await ProjectTasks.updateAsync(
      { projectId },
      {
        $unset: { projectId: 1 },
        $set: { updatedAt: new Date(), updatedBy: userId },
        $inc: { revision: 1 },
      },
      { multi: true }
    );
  }
  await Projects.removeAsync(projectId);
  await logProject(project, ProjectsAction.PROJECT_DELETED, userId, {
    title: project.title,
    tasks,
  });
}

export interface ListProjectsOptions extends ProjectsPageOptions {
  /** One status or a list. */
  status?: ProjectStatusValue | ProjectStatusValue[];
  /** Projects this person participates in. */
  participantId?: string;
  /** Projects that have all of these tags. */
  tags?: string[];
  /** `{ key: value }`: exact match on top-level metadata values. */
  metadata?: Record<string, unknown>;
  /** Whole words in title, objective, description and tags. */
  text?: string;
  /** Default `createdAt`. */
  sortBy?: 'createdAt' | 'targetDate' | 'title';
  /** Default `desc` (`asc` for `title`). */
  sortOrder?: ProjectsSortOrder;
}

/** A workspace's projects. */
export async function listProjects(
  workspaceId: string,
  userId: string,
  options: ListProjectsOptions = {}
): Promise<ProjectsPage<ProjectDocument>> {
  requireUserId(userId);
  await requireWorkspace(workspaceId);
  return findProjects({ workspaceId }, options);
}

export interface ListParticipantProjectsOptions extends ListProjectsOptions {
  /** Only projects in these workspaces - the ones the caller authorised. */
  workspaceIds?: string[];
}

/** Projects a person participates in, across workspaces. */
export async function listParticipantProjects(
  participantId: string,
  userId: string,
  { workspaceIds, ...options }: ListParticipantProjectsOptions = {}
): Promise<ProjectsPage<ProjectDocument>> {
  requireUserId(userId);
  const id = normalizeOpaqueId(participantId, 'Participant id');
  return findProjects(
    { workspaceId: await liveWorkspaceSelector(workspaceIds) },
    { ...options, participantId: id }
  );
}

async function findProjects(
  base: Record<string, unknown>,
  {
    status,
    participantId,
    tags,
    metadata,
    text,
    sortBy = 'createdAt',
    sortOrder,
    ...page
  }: ListProjectsOptions
): Promise<ProjectsPage<ProjectDocument>> {
  const selector: Record<string, unknown> = { ...base };
  if (status !== undefined) {
    selector.status = {
      $in: (Array.isArray(status) ? status : [status]).map(value =>
        requireOneOf(value, ProjectStatus, 'Status')
      ),
    };
  }
  if (participantId) selector.participantIds = participantId;
  const normalizedTags = normalizeTags(tags);
  if (normalizedTags.length) selector.tags = { $all: normalizedTags };
  Object.entries(metadata ?? {}).forEach(([key, value]) => {
    if (!METADATA_KEY_PATTERN.test(key)) {
      throw projectsError('BAD_USER_INPUT', `Invalid metadata key "${key}"`);
    }
    selector[`metadata.${key}`] = value;
  });
  if (text?.trim()) selector.$text = { $search: text.trim() };

  const { skip, limit } = normalizePage(page);
  const direction =
    (sortOrder ?? (sortBy === 'title' ? 'asc' : 'desc')) === 'desc' ? -1 : 1;
  const [data, totalResults] = await Promise.all([
    Projects.find(selector, {
      sort: { [sortBy]: direction, _id: direction },
      skip,
      limit,
    }).fetchAsync(),
    Projects.find(selector).countAsync(),
  ]);
  return { data, totalResults };
}
