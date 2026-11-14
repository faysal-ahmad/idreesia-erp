import { MEETINGS_DEFAULT_TIME_ZONE } from 'meteor/idreesia-common/constants/meetings';
import {
  PROJECTS_MODULE,
  ProjectsAction,
  ProjectsEntityType,
  TaskPriority,
  type ProjectStatusValue,
  type TaskPriorityValue,
  type TaskStatusValue,
} from 'meteor/idreesia-common/constants/projects';
import { Users } from 'meteor/idreesia-common/server/collections/admin';
import type {
  ProjectDocument,
  ProjectTaskDocument,
} from 'meteor/idreesia-common/server/collections/projects';
import {
  createNotifier,
  type ModuleNotification,
} from 'meteor/idreesia-common/server/headless';

/**
 * The notifications the projects module publishes, each to the people
 * concerned (never to the user who caused it):
 *
 * Tasks
 * - a task was assigned to you, or unassigned from you;
 * - your task's status, due date or priority (high or urgent) changed;
 * - your task was deleted;
 * - a task you created was completed;
 * - someone commented on your task.
 *
 * Projects (to participants)
 * - you were added to or removed from a project;
 * - a project's status changed;
 * - a project's title, objective, description or dates changed;
 * - a project was deleted.
 *
 * Participant and assignee ids are opaque to the module, but notifications
 * go to ERP users: such an id is looked up as a person id, and a person with
 * no ERP user is simply not notified. A task's creator is already an ERP
 * user id.
 *
 * Publishing is best effort: a failure is logged and never fails the
 * operation that caused it.
 */

const notifier = createNotifier(PROJECTS_MODULE);

type NotifiableProject = Pick<ProjectDocument, '_id' | 'workspaceId' | 'title'>;
type NotifiableTask = Pick<
  ProjectTaskDocument,
  '_id' | 'workspaceId' | 'projectId' | 'title'
>;

/** Logs a failed publish instead of failing the operation that caused it. */
const bestEffort = async (description: string, action: () => Promise<void>) => {
  try {
    await action();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Projects: could not ${description}:`, error);
  }
};

const PROJECT_STATUS_LABELS: Record<ProjectStatusValue, string> = {
  planned: 'planned',
  active: 'active',
  'on-hold': 'on hold',
  completed: 'completed',
  cancelled: 'cancelled',
};

const TASK_STATUS_LABELS: Record<TaskStatusValue, string> = {
  todo: 'to do',
  'in-progress': 'in progress',
  blocked: 'blocked',
  done: 'done',
  cancelled: 'cancelled',
};

const formatDate = (date: Date) => {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'medium',
      timeZone: MEETINGS_DEFAULT_TIME_ZONE,
    }).format(date);
  } catch {
    return date.toISOString();
  }
};

type Details = {
  eventType: string;
  text: string;
  id: string;
  data?: Record<string, unknown>;
};

/**
 * The event time goes into `data`. The notifier skips content it already
 * has, so without the time a repeated event (a second comment, a task
 * assigned to the same person again) would stay read.
 */
const withEventTime = (
  data: Record<string, unknown> | undefined,
  now: Date
): Record<string, unknown> => ({ ...(data ?? {}), at: now.toISOString() });

const buildForProject = (
  project: NotifiableProject,
  { id, eventType, text, data }: Details,
  recipientUserId: string,
  actorUserId: string,
  now: Date
): ModuleNotification => {
  const details = withEventTime(data, now);
  return {
    id,
    workspaceId: project.workspaceId,
    entityType: ProjectsEntityType.PROJECT,
    entityId: project._id,
    eventType,
    eventDetails: text,
    data: details,
    createdAt: now,
    recipientUserId,
    actorUserId,
  };
};

const buildForTask = (
  task: NotifiableTask,
  { id, eventType, text, data }: Details,
  recipientUserId: string,
  actorUserId: string | undefined,
  now: Date
): ModuleNotification => {
  const merged = {
    ...(task.projectId ? { projectId: task.projectId } : {}),
    ...withEventTime(data, now),
  };
  return {
    id,
    workspaceId: task.workspaceId,
    entityType: ProjectsEntityType.TASK,
    entityId: task._id,
    eventType,
    eventDetails: text,
    ...(Object.keys(merged).length ? { data: merged } : {}),
    createdAt: now,
    recipientUserId,
    ...(actorUserId ? { actorUserId } : {}),
  };
};

// ---------------------------------------------------------------------------
// Builders
// ---------------------------------------------------------------------------

/**
 * A task was assigned to the user. One id per task and user, so reassigning
 * it back and forth is one notification, unread again each time.
 */
export const buildTaskAssignedNotification = (
  task: NotifiableTask,
  recipientUserId: string,
  actorUserId: string,
  now = new Date()
): ModuleNotification =>
  buildForTask(
    task,
    {
      id: `task-assigned:${task._id}:${recipientUserId}`,
      eventType: ProjectsAction.TASK_ASSIGNED,
      text: `You were assigned the task "${task.title}".`,
    },
    recipientUserId,
    actorUserId,
    now
  );

/** A task was taken away from the user (unassigned or given to someone else). */
export const buildTaskUnassignedNotification = (
  task: NotifiableTask,
  recipientUserId: string,
  actorUserId: string,
  now = new Date()
): ModuleNotification =>
  buildForTask(
    task,
    {
      id: `task-unassigned:${task._id}:${recipientUserId}`,
      eventType: 'task-unassigned',
      text: `You are no longer assigned the task "${task.title}".`,
    },
    recipientUserId,
    actorUserId,
    now
  );

/** The task's status changed. One id per task and user. */
export const buildTaskStatusNotification = (
  task: NotifiableTask,
  status: TaskStatusValue,
  recipientUserId: string,
  actorUserId: string,
  now = new Date()
): ModuleNotification =>
  buildForTask(
    task,
    {
      id: `task-status:${task._id}:${recipientUserId}`,
      eventType: ProjectsAction.TASK_STATUS_CHANGED,
      text: `The task "${task.title}" is now ${TASK_STATUS_LABELS[status]}.`,
      data: { status },
    },
    recipientUserId,
    actorUserId,
    now
  );

/** A task the user created was completed by someone else. */
export const buildTaskCompletedNotification = (
  task: NotifiableTask,
  recipientUserId: string,
  actorUserId: string,
  now = new Date()
): ModuleNotification =>
  buildForTask(
    task,
    {
      id: `task-completed:${task._id}:${recipientUserId}`,
      eventType: 'task-completed',
      text: `The task "${task.title}" was completed.`,
    },
    recipientUserId,
    actorUserId,
    now
  );

/** The due date moved, or was removed. One id per task and user. */
export const buildTaskDueDateChangedNotification = (
  task: NotifiableTask,
  dueDate: Date | undefined,
  recipientUserId: string,
  actorUserId: string,
  now = new Date()
): ModuleNotification =>
  buildForTask(
    task,
    {
      id: `task-due-changed:${task._id}:${recipientUserId}`,
      eventType: 'task-due-date-changed',
      text: dueDate
        ? `The due date of "${task.title}" is now ${formatDate(dueDate)}.`
        : `The due date of "${task.title}" was removed.`,
      ...(dueDate ? { data: { dueDate: dueDate.toISOString() } } : {}),
    },
    recipientUserId,
    actorUserId,
    now
  );

/** The task's priority was raised to high or urgent. */
export const buildTaskPriorityNotification = (
  task: NotifiableTask,
  priority: TaskPriorityValue,
  recipientUserId: string,
  actorUserId: string,
  now = new Date()
): ModuleNotification =>
  buildForTask(
    task,
    {
      id: `task-priority:${task._id}:${recipientUserId}`,
      eventType: 'task-priority-changed',
      text: `The task "${task.title}" is now ${priority} priority.`,
      data: { priority },
    },
    recipientUserId,
    actorUserId,
    now
  );

/** The task was deleted. */
export const buildTaskDeletedNotification = (
  task: NotifiableTask,
  recipientUserId: string,
  actorUserId: string,
  now = new Date()
): ModuleNotification =>
  buildForTask(
    task,
    {
      id: `task-deleted:${task._id}:${recipientUserId}`,
      eventType: ProjectsAction.TASK_DELETED,
      text: `The task "${task.title}" was deleted.`,
    },
    recipientUserId,
    actorUserId,
    now
  );

/**
 * Someone commented on the user's task. One id per task and user, so a busy
 * thread is one notification, unread again with each comment.
 */
export const buildTaskCommentNotification = (
  task: NotifiableTask,
  recipientUserId: string,
  actorUserId: string,
  now = new Date()
): ModuleNotification =>
  buildForTask(
    task,
    {
      id: `task-comment:${task._id}:${recipientUserId}`,
      eventType: ProjectsAction.COMMENT_ADDED,
      text: `There is a new comment on your task "${task.title}".`,
    },
    recipientUserId,
    actorUserId,
    now
  );

/** The user was added to a project. */
export const buildAddedToProjectNotification = (
  project: NotifiableProject,
  recipientUserId: string,
  actorUserId: string,
  now = new Date()
): ModuleNotification =>
  buildForProject(
    project,
    {
      id: `project-added:${project._id}:${recipientUserId}`,
      eventType: ProjectsAction.PARTICIPANTS_ADDED,
      text: `You were added to the project "${project.title}".`,
    },
    recipientUserId,
    actorUserId,
    now
  );

/** The user was removed from a project. */
export const buildRemovedFromProjectNotification = (
  project: NotifiableProject,
  recipientUserId: string,
  actorUserId: string,
  now = new Date()
): ModuleNotification =>
  buildForProject(
    project,
    {
      id: `project-removed:${project._id}:${recipientUserId}`,
      eventType: ProjectsAction.PARTICIPANT_REMOVED,
      text: `You were removed from the project "${project.title}".`,
    },
    recipientUserId,
    actorUserId,
    now
  );

/**
 * The project's status changed. One id per project and user, so several
 * changes are one notification whose text follows the latest status.
 */
export const buildProjectStatusNotification = (
  project: NotifiableProject,
  status: ProjectStatusValue,
  recipientUserId: string,
  actorUserId: string,
  now = new Date()
): ModuleNotification =>
  buildForProject(
    project,
    {
      id: `project-status:${project._id}:${recipientUserId}`,
      eventType: ProjectsAction.PROJECT_STATUS_CHANGED,
      text: `The project "${project.title}" is now ${PROJECT_STATUS_LABELS[status]}.`,
      data: { status },
    },
    recipientUserId,
    actorUserId,
    now
  );

/** The project's title, objective, description or dates were edited. */
export const buildProjectUpdatedNotification = (
  project: NotifiableProject,
  recipientUserId: string,
  actorUserId: string,
  now = new Date()
): ModuleNotification =>
  buildForProject(
    project,
    {
      id: `project-updated:${project._id}:${recipientUserId}`,
      eventType: ProjectsAction.PROJECT_UPDATED,
      text: `The project "${project.title}" was updated.`,
    },
    recipientUserId,
    actorUserId,
    now
  );

/** The project was deleted. */
export const buildProjectDeletedNotification = (
  project: NotifiableProject,
  recipientUserId: string,
  actorUserId: string,
  now = new Date()
): ModuleNotification =>
  buildForProject(
    project,
    {
      id: `project-deleted:${project._id}:${recipientUserId}`,
      eventType: ProjectsAction.PROJECT_DELETED,
      text: `The project "${project.title}" was deleted.`,
    },
    recipientUserId,
    actorUserId,
    now
  );

// ---------------------------------------------------------------------------
// Recipients
// ---------------------------------------------------------------------------

/** The ERP users behind these people, leaving out the acting user. */
const recipientUserIds = async (
  personIds: string[],
  actorUserId?: string
): Promise<string[]> => {
  if (!personIds.length) return [];
  const users = await Users.findByPersonIds(personIds);
  return users.map(({ _id }) => _id).filter(id => id !== actorUserId);
};

const publishToPeople = async (
  personIds: string[],
  actorUserId: string | undefined,
  buildFor: (userId: string) => ModuleNotification
) => {
  for (const userId of await recipientUserIds(personIds, actorUserId)) {
    await notifier.publish(buildFor(userId));
  }
};

// ---------------------------------------------------------------------------
// Task notifiers
// ---------------------------------------------------------------------------

type TaskWithAssignee = NotifiableTask & { assigneeId?: string };

/** The task's assignee, if there is one. Callers publish only on a change. */
export const notifyTaskAssigned = (
  task: TaskWithAssignee,
  actorUserId: string
) =>
  bestEffort('publish the task assigned notification', async () => {
    if (!task.assigneeId) return;
    await publishToPeople([task.assigneeId], actorUserId, userId =>
      buildTaskAssignedNotification(task, userId, actorUserId)
    );
  });

/** The person the task was taken from. */
export const notifyTaskUnassigned = (
  task: NotifiableTask,
  previousAssigneeId: string,
  actorUserId: string
) =>
  bestEffort('publish the task unassigned notification', async () => {
    await publishToPeople([previousAssigneeId], actorUserId, userId =>
      buildTaskUnassignedNotification(task, userId, actorUserId)
    );
  });

/**
 * The status changed: tell the assignee, and tell the creator when the task
 * was completed (unless the assignee is the creator, who gets the first one).
 */
export const notifyTaskStatusChanged = (
  task: TaskWithAssignee & Pick<ProjectTaskDocument, 'createdBy'>,
  status: TaskStatusValue,
  actorUserId: string
) =>
  bestEffort('publish the task status notifications', async () => {
    const assigneeUserIds = task.assigneeId
      ? await recipientUserIds([task.assigneeId], undefined)
      : [];
    for (const userId of assigneeUserIds) {
      if (userId === actorUserId) continue;
      await notifier.publish(
        buildTaskStatusNotification(task, status, userId, actorUserId)
      );
    }

    const creatorId = task.createdBy;
    if (
      status === 'done' &&
      creatorId &&
      creatorId !== actorUserId &&
      !assigneeUserIds.includes(creatorId)
    ) {
      await notifier.publish(
        buildTaskCompletedNotification(task, creatorId, actorUserId)
      );
    }
  });

export const notifyTaskDueDateChanged = (
  task: TaskWithAssignee,
  dueDate: Date | undefined,
  actorUserId: string
) =>
  bestEffort('publish the task due date notification', async () => {
    if (!task.assigneeId) return;
    await publishToPeople([task.assigneeId], actorUserId, userId =>
      buildTaskDueDateChangedNotification(task, dueDate, userId, actorUserId)
    );
  });

/** Only a raise to high or urgent is worth telling the assignee about. */
export const notifyTaskPriorityChanged = (
  task: TaskWithAssignee,
  priority: TaskPriorityValue,
  actorUserId: string
) =>
  bestEffort('publish the task priority notification', async () => {
    if (!task.assigneeId) return;
    if (priority !== TaskPriority.HIGH && priority !== TaskPriority.URGENT) {
      return;
    }
    await publishToPeople([task.assigneeId], actorUserId, userId =>
      buildTaskPriorityNotification(task, priority, userId, actorUserId)
    );
  });

export const notifyTaskDeleted = (
  task: TaskWithAssignee,
  actorUserId: string
) =>
  bestEffort('publish the task deleted notification', async () => {
    if (!task.assigneeId) return;
    await publishToPeople([task.assigneeId], actorUserId, userId =>
      buildTaskDeletedNotification(task, userId, actorUserId)
    );
  });

/** Only a task with an assignee has someone to tell. */
export const notifyTaskComment = (
  task: TaskWithAssignee,
  actorUserId: string
) =>
  bestEffort('publish the task comment notification', async () => {
    if (!task.assigneeId) return;
    await publishToPeople([task.assigneeId], actorUserId, userId =>
      buildTaskCommentNotification(task, userId, actorUserId)
    );
  });

// ---------------------------------------------------------------------------
// Project notifiers
// ---------------------------------------------------------------------------

export const notifyAddedToProject = (
  project: NotifiableProject,
  participantIds: string[],
  actorUserId: string
) =>
  bestEffort('publish the added to project notifications', () =>
    publishToPeople(participantIds, actorUserId, userId =>
      buildAddedToProjectNotification(project, userId, actorUserId)
    )
  );

export const notifyRemovedFromProject = (
  project: NotifiableProject,
  participantId: string,
  actorUserId: string
) =>
  bestEffort('publish the removed from project notification', () =>
    publishToPeople([participantId], actorUserId, userId =>
      buildRemovedFromProjectNotification(project, userId, actorUserId)
    )
  );

export const notifyProjectStatusChanged = (
  project: NotifiableProject & Pick<ProjectDocument, 'participantIds'>,
  status: ProjectStatusValue,
  actorUserId: string
) =>
  bestEffort('publish the project status notifications', () =>
    publishToPeople(project.participantIds, actorUserId, userId =>
      buildProjectStatusNotification(project, status, userId, actorUserId)
    )
  );

export const notifyProjectUpdated = (
  project: NotifiableProject & Pick<ProjectDocument, 'participantIds'>,
  actorUserId: string
) =>
  bestEffort('publish the project updated notifications', () =>
    publishToPeople(project.participantIds, actorUserId, userId =>
      buildProjectUpdatedNotification(project, userId, actorUserId)
    )
  );

export const notifyProjectDeleted = (
  project: NotifiableProject & Pick<ProjectDocument, 'participantIds'>,
  actorUserId: string
) =>
  bestEffort('publish the project deleted notifications', () =>
    publishToPeople(project.participantIds, actorUserId, userId =>
      buildProjectDeletedNotification(project, userId, actorUserId)
    )
  );
