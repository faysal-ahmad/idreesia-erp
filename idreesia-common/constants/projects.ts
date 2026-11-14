/**
 * Constants for the headless projects and tasks module
 * (server/business-logic/projects).
 */

/** The module's name as a headless module (notifications are keyed by it). */
export const PROJECTS_MODULE = 'projects';

export const ProjectStatus = {
  PLANNED: 'planned',
  ACTIVE: 'active',
  ON_HOLD: 'on-hold',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;
export type ProjectStatusValue =
  (typeof ProjectStatus)[keyof typeof ProjectStatus];

/** Project states in which the project and its tasks can still change. */
export const OpenProjectStatuses: ProjectStatusValue[] = [
  ProjectStatus.PLANNED,
  ProjectStatus.ACTIVE,
  ProjectStatus.ON_HOLD,
];

export const TaskStatus = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  BLOCKED: 'blocked',
  DONE: 'done',
  CANCELLED: 'cancelled',
} as const;
export type TaskStatusValue = (typeof TaskStatus)[keyof typeof TaskStatus];

/** Task states that still need work. */
export const OpenTaskStatuses: TaskStatusValue[] = [
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.BLOCKED,
];

export const TaskPriority = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;
export type TaskPriorityValue =
  (typeof TaskPriority)[keyof typeof TaskPriority];

export const ProjectsEntityType = {
  WORKSPACE: 'workspace',
  PROJECT: 'project',
  TASK: 'task',
  COMMENT: 'comment',
} as const;
export type ProjectsEntityTypeValue =
  (typeof ProjectsEntityType)[keyof typeof ProjectsEntityType];

export const ProjectsAction = {
  WORKSPACE_CREATED: 'workspace-created',
  WORKSPACE_UPDATED: 'workspace-updated',
  WORKSPACE_DELETED: 'workspace-deleted',
  WORKSPACE_RESTORED: 'workspace-restored',

  PROJECT_CREATED: 'project-created',
  PROJECT_UPDATED: 'project-updated',
  PROJECT_STATUS_CHANGED: 'project-status-changed',
  PARTICIPANTS_ADDED: 'participants-added',
  PARTICIPANT_REMOVED: 'participant-removed',
  PROJECT_DELETED: 'project-deleted',

  TASK_CREATED: 'task-created',
  TASK_UPDATED: 'task-updated',
  TASK_ASSIGNED: 'task-assigned',
  TASK_STATUS_CHANGED: 'task-status-changed',
  TASK_PROGRESS_CHANGED: 'task-progress-changed',
  TASK_DELETED: 'task-deleted',

  COMMENT_ADDED: 'comment-added',
  COMMENT_DELETED: 'comment-deleted',
} as const;
export type ProjectsActionValue =
  (typeof ProjectsAction)[keyof typeof ProjectsAction];

export const PROJECTS_DEFAULT_PAGE_SIZE = 50;
export const PROJECTS_MAX_PAGE_SIZE = 200;
export const PROJECTS_MAX_TITLE_LENGTH = 255;
export const PROJECTS_MAX_COMMENT_LENGTH = 5000;
export const PROJECTS_MAX_PARTICIPANTS = 200;
