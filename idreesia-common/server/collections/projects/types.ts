import type {
  ProjectsActionValue,
  ProjectsEntityTypeValue,
  ProjectStatusValue,
  TaskPriorityValue,
  TaskStatusValue,
} from 'meteor/idreesia-common/constants/projects';

/** Free-form key/value data callers attach to workspaces, projects and tasks. */
export type ProjectsMetadata = Record<string, unknown>;

interface Timestamps {
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
  deletedAt?: Date;
  deletedBy?: string;
}

export interface ProjectsWorkspaceDocument extends Timestamps {
  _id: string;
  name: string;
  description?: string;
  metadata?: ProjectsMetadata;
}

export interface ProjectDocument extends Timestamps {
  _id: string;
  workspaceId: string;
  title: string;
  objective?: string;
  description?: string;
  status: ProjectStatusValue;
  /** Opaque ids chosen by the caller. */
  participantIds: string[];
  startDate?: Date;
  targetDate?: Date;
  tags: string[];
  metadata?: ProjectsMetadata;
  /** Opaque id of the project's chat group, set by the consuming feature. */
  chatGroupId?: string;
  /** Tasks other than cancelled ones. */
  taskCount: number;
  doneCount: number;
  /** 0-100, the average progress of the counted tasks. */
  progress: number;
  completedAt?: Date;
  completedBy?: string;
  revision: number;
}

export interface ProjectTaskDocument extends Timestamps {
  _id: string;
  workspaceId: string;
  /** Unset for a standalone task. */
  projectId?: string;
  title: string;
  description?: string;
  assigneeId?: string;
  dueDate?: Date;
  status: TaskStatusValue;
  priority: TaskPriorityValue;
  /** 0-100. */
  progress: number;
  tags: string[];
  metadata?: ProjectsMetadata;
  completedAt?: Date;
  completedBy?: string;
  commentCount: number;
  revision: number;
}

export interface ProjectCommentDocument extends Timestamps {
  _id: string;
  workspaceId: string;
  taskId: string;
  authorId: string;
  text: string;
}

export interface ProjectsActivityDocument {
  _id: string;
  workspaceId: string;
  projectId?: string;
  taskId?: string;
  entityType: ProjectsEntityTypeValue;
  entityId: string;
  action: ProjectsActionValue;
  userId: string;
  at: Date;
  details?: Record<string, unknown>;
}
