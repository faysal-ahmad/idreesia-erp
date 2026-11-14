/**
 * The projects and tasks UI is reusable: it knows nothing about committees or
 * any other host. Each place that shows projects supplies a data provider
 * implementing `ProjectsDataProvider`.
 *
 * Timestamps are milliseconds since the epoch, as strings. Person ids are
 * whatever the host uses for its members.
 */

export type ProjectStatus =
  | 'planned'
  | 'active'
  | 'on-hold'
  | 'completed'
  | 'cancelled';
export type TaskStatus =
  | 'todo'
  | 'in-progress'
  | 'blocked'
  | 'done'
  | 'cancelled';
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';

/** Which projects a list shows. */
export type ProjectsView = 'active' | 'completed' | 'mine' | 'all';
/** Which tasks a list shows. */
export type TasksView = 'open' | 'mine' | 'overdue' | 'done' | 'all';

export interface ProjectsInfo {
  /** The current user can create projects and standalone tasks. */
  canManage: boolean;
  /** The current user's person id. */
  myPersonId: string | null;
}

/** Someone who can own or take part in projects, or be assigned tasks. */
export interface ProjectMember {
  personId: string;
  name: string | null;
  isCoordinator: boolean;
}

export interface ProjectParticipant {
  personId: string;
  name: string | null;
}

export interface Project {
  _id: string;
  title: string;
  objective: string | null;
  description: string | null;
  status: ProjectStatus;
  participants: ProjectParticipant[];
  participantCount: number;
  /** The current user takes part (and so can use the project chat). */
  isParticipant: boolean;
  /** The current user can edit it, manage participants and its tasks. */
  canManage: boolean;
  startDate: string | null;
  targetDate: string | null;
  isOverdue: boolean;
  taskCount: number;
  doneCount: number;
  openTaskCount: number;
  /** 0-100, from its tasks. */
  progress: number;
  tags: string[];
  completedAt: string | null;
  completedByName: string | null;
  createdAt: string | null;
  createdByName: string | null;
  updatedAt: string | null;
  updatedByName: string | null;
}

export interface ProjectPage {
  projects: Project[];
  totalResults: number;
}

export interface ProjectsQuery {
  view: ProjectsView;
  text?: string;
  pageIndex: number;
  pageSize: number;
}

/** What the project create / edit form saves. */
export interface ProjectDetails {
  title: string;
  objective: string | null;
  description: string | null;
  /** Create only; participants are managed on the project afterwards. */
  participantIds?: string[];
  startDate: string | null;
  targetDate: string | null;
  tags: string[];
}

export interface Task {
  _id: string;
  /** Null for a standalone task. */
  projectId: string | null;
  projectTitle: string | null;
  title: string;
  description: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
  dueDate: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  /** 0-100. */
  progress: number;
  isOverdue: boolean;
  tags: string[];
  commentCount: number;
  /** The current user can edit, move and delete it. */
  canManage: boolean;
  /** The current user can change its status and progress. */
  canUpdate: boolean;
  completedAt: string | null;
  completedByName: string | null;
  createdAt: string | null;
  createdByName: string | null;
  updatedAt: string | null;
  updatedByName: string | null;
}

export interface TaskPage {
  tasks: Task[];
  totalResults: number;
}

export interface TasksQuery {
  view: TasksView;
  /** Only this project's tasks. */
  projectId?: string;
  /** Only tasks that are not part of a project. */
  standalone?: boolean;
  assigneeId?: string;
  priority?: TaskPriority;
  text?: string;
  pageIndex: number;
  pageSize: number;
}

/** What the task create / edit form saves. */
export interface TaskDetails {
  title: string;
  description: string | null;
  assigneeId: string | null;
  dueDate: string | null;
  priority: TaskPriority;
  tags: string[];
  /** Create only. */
  projectId?: string | null;
}

export interface TaskComment {
  _id: string;
  taskId: string;
  text: string;
  authorName: string | null;
  isOwn: boolean;
  canDelete: boolean;
  createdAt: string | null;
}

export interface ProjectsActivity {
  _id: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  projectId: string | null;
  taskId: string | null;
  userName: string | null;
  at: string | null;
  details: Record<string, unknown>;
}

export class ProjectsError extends Error {
  constructor(
    message: string,
    readonly code: string | null = null
  ) {
    super(message);
    this.name = 'ProjectsError';
  }
}

/**
 * Every action rejects with a `ProjectsError` whose message is shown to the
 * user.
 */
export interface ProjectsDataProvider {
  getInfo(): Promise<ProjectsInfo>;
  loadMembers(): Promise<ProjectMember[]>;

  loadProjects(query: ProjectsQuery): Promise<ProjectPage>;
  loadProject(projectId: string): Promise<Project>;
  createProject(details: ProjectDetails): Promise<Project>;
  updateProject(projectId: string, details: ProjectDetails): Promise<Project>;
  /** `force`: complete the project even though tasks are still open. */
  setProjectStatus(
    projectId: string,
    status: ProjectStatus,
    force?: boolean
  ): Promise<Project>;
  addParticipants(projectId: string, personIds: string[]): Promise<Project>;
  /** `unassignTasks`: also unassign their open tasks in the project. */
  removeParticipant(
    projectId: string,
    personId: string,
    unassignTasks?: boolean
  ): Promise<Project>;
  /** `deleteTasks`: delete its tasks too; otherwise they become standalone. */
  deleteProject(projectId: string, deleteTasks?: boolean): Promise<void>;

  loadTasks(query: TasksQuery): Promise<TaskPage>;
  loadTask(taskId: string): Promise<Task>;
  createTask(details: TaskDetails): Promise<Task>;
  updateTask(taskId: string, details: TaskDetails): Promise<Task>;
  /** `projectId` null: make the task standalone. */
  deleteTask(taskId: string): Promise<void>;
  setTaskStatus(taskId: string, status: TaskStatus): Promise<Task>;
  setTaskProgress(taskId: string, progress: number): Promise<Task>;

  loadComments(taskId: string): Promise<TaskComment[]>;
  addComment(taskId: string, text: string): Promise<TaskComment>;
  deleteComment(commentId: string): Promise<void>;

  /** Managers only. Newest first; `before` is the last entry's `at`. */
  loadActivity(
    scope: { projectId?: string; taskId?: string },
    before?: string
  ): Promise<ProjectsActivity[]>;
}
