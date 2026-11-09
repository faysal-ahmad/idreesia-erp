import type { ApolloClient } from '@apollo/client';
import type {
  WorkspaceProjectFieldsFragment,
  WorkspaceTaskCommentFieldsFragment,
  WorkspaceTaskFieldsFragment,
} from 'meteor/idreesia-common/types/client-operations';

import {
  ProjectsError,
  type Project,
  type ProjectDetails,
  type ProjectMember,
  type ProjectPage,
  type ProjectsActivity,
  type ProjectsDataProvider,
  type ProjectsInfo,
  type ProjectsQuery,
  type ProjectStatus,
  type Task,
  type TaskComment,
  type TaskDetails,
  type TaskPage,
  type TaskPriority,
  type TasksQuery,
  type TaskStatus,
} from '/imports/ui/modules/common/projects';

import {
  WORKSPACE_ADD_PROJECT_PARTICIPANTS,
  WORKSPACE_ADD_TASK_COMMENT,
  WORKSPACE_CREATE_PROJECT,
  WORKSPACE_CREATE_TASK,
  WORKSPACE_DELETE_PROJECT,
  WORKSPACE_DELETE_TASK,
  WORKSPACE_DELETE_TASK_COMMENT,
  WORKSPACE_PROJECT_BY_ID,
  WORKSPACE_PROJECT_MEMBERS,
  WORKSPACE_PROJECTS,
  WORKSPACE_PROJECTS_ACTIVITY,
  WORKSPACE_PROJECTS_INFO,
  WORKSPACE_REMOVE_PROJECT_PARTICIPANT,
  WORKSPACE_SET_PROJECT_STATUS,
  WORKSPACE_SET_TASK_PROGRESS,
  WORKSPACE_SET_TASK_STATUS,
  WORKSPACE_TASK_BY_ID,
  WORKSPACE_TASK_COMMENTS,
  WORKSPACE_TASKS,
  WORKSPACE_UPDATE_PROJECT,
  WORKSPACE_UPDATE_TASK,
} from './gql';

const notNull = <T>(value: T | null | undefined): value is T => value != null;

/** The server's message and error code, from an Apollo or network error. */
const toProjectsError = (error: unknown): ProjectsError => {
  if (error instanceof ProjectsError) return error;
  const [graphQLError] =
    (
      error as {
        errors?: Array<{ message?: string; extensions?: { code?: unknown } }>;
      }
    )?.errors ?? [];
  if (graphQLError?.message) {
    const code = graphQLError.extensions?.code;
    return new ProjectsError(
      graphQLError.message,
      typeof code === 'string' ? code : null
    );
  }
  return new ProjectsError(
    error instanceof Error ? error.message : 'Something went wrong.'
  );
};

const mapProject = (project: WorkspaceProjectFieldsFragment): Project => ({
  _id: project._id!,
  title: project.title ?? '',
  objective: project.objective ?? null,
  description: project.description ?? null,
  status: (project.status ?? 'active') as ProjectStatus,
  participants: (project.participants ?? []).filter(notNull).map(p => ({
    personId: p.personId ?? '',
    name: p.name ?? null,
  })),
  participantCount: project.participantCount ?? 0,
  isParticipant: !!project.isParticipant,
  canManage: !!project.canManage,
  startDate: project.startDate ?? null,
  targetDate: project.targetDate ?? null,
  isOverdue: !!project.isOverdue,
  taskCount: project.taskCount ?? 0,
  doneCount: project.doneCount ?? 0,
  openTaskCount: project.openTaskCount ?? 0,
  progress: project.progress ?? 0,
  tags: (project.tags ?? []).filter(notNull),
  completedAt: project.completedAt ?? null,
  completedByName: project.completedByName ?? null,
  createdAt: project.createdAt ?? null,
  createdByName: project.createdByName ?? null,
  updatedAt: project.updatedAt ?? null,
  updatedByName: project.updatedByName ?? null,
});

const mapTask = (task: WorkspaceTaskFieldsFragment): Task => ({
  _id: task._id!,
  projectId: task.projectId ?? null,
  projectTitle: task.projectTitle ?? null,
  title: task.title ?? '',
  description: task.description ?? null,
  assigneeId: task.assigneeId ?? null,
  assigneeName: task.assigneeName ?? null,
  dueDate: task.dueDate ?? null,
  status: (task.status ?? 'todo') as TaskStatus,
  priority: (task.priority ?? 'normal') as TaskPriority,
  progress: task.progress ?? 0,
  isOverdue: !!task.isOverdue,
  tags: (task.tags ?? []).filter(notNull),
  commentCount: task.commentCount ?? 0,
  canManage: !!task.canManage,
  canUpdate: !!task.canUpdate,
  completedAt: task.completedAt ?? null,
  completedByName: task.completedByName ?? null,
  createdAt: task.createdAt ?? null,
  createdByName: task.createdByName ?? null,
  updatedAt: task.updatedAt ?? null,
  updatedByName: task.updatedByName ?? null,
});

const mapComment = (comment: WorkspaceTaskCommentFieldsFragment): TaskComment => ({
  _id: comment._id!,
  taskId: comment.taskId ?? '',
  text: comment.text ?? '',
  authorName: comment.authorName ?? null,
  isOwn: !!comment.isOwn,
  canDelete: !!comment.canDelete,
  createdAt: comment.createdAt ?? null,
});

const parseDetails = (details: string | null | undefined) => {
  if (!details) return {};
  try {
    return JSON.parse(details) as Record<string, unknown>;
  } catch {
    return {};
  }
};

/** Projects and tasks for a committee in Workspaces, over GraphQL. */
export default class CommitteeProjectsProvider implements ProjectsDataProvider {
  constructor(
    private readonly client: ApolloClient,
    private readonly committeeId: string
  ) {}

  private async run<T>(action: () => Promise<T>): Promise<T> {
    try {
      return await action();
    } catch (error) {
      throw toProjectsError(error);
    }
  }

  private query<TData>(
    query: Parameters<ApolloClient['query']>[0]['query'],
    variables: Record<string, unknown> = {}
  ): Promise<TData> {
    return this.run(async () => {
      const { data } = await this.client.query({
        query,
        variables: { committeeId: this.committeeId, ...variables },
        fetchPolicy: 'network-only',
      });
      return data as TData;
    });
  }

  private mutate<TData>(
    mutation: Parameters<ApolloClient['mutate']>[0]['mutation'],
    variables: Record<string, unknown>
  ): Promise<TData> {
    return this.run(async () => {
      const { data } = await this.client.mutate({
        mutation,
        variables: { committeeId: this.committeeId, ...variables },
      });
      return data as TData;
    });
  }

  private async mutateProject(
    mutation: Parameters<ApolloClient['mutate']>[0]['mutation'],
    field: string,
    variables: Record<string, unknown>
  ): Promise<Project> {
    const data = await this.mutate<
      Record<string, WorkspaceProjectFieldsFragment | null>
    >(mutation, variables);
    const project = data?.[field];
    if (!project?._id) throw new ProjectsError('The project was not returned.');
    return mapProject(project);
  }

  private async mutateTask(
    mutation: Parameters<ApolloClient['mutate']>[0]['mutation'],
    field: string,
    variables: Record<string, unknown>
  ): Promise<Task> {
    const data = await this.mutate<
      Record<string, WorkspaceTaskFieldsFragment | null>
    >(mutation, variables);
    const task = data?.[field];
    if (!task?._id) throw new ProjectsError('The task was not returned.');
    return mapTask(task);
  }

  async getInfo(): Promise<ProjectsInfo> {
    const data = await this.query<{
      workspaceProjectsInfo?: { canManage?: boolean | null; myPersonId?: string | null } | null;
    }>(WORKSPACE_PROJECTS_INFO);
    return {
      canManage: !!data?.workspaceProjectsInfo?.canManage,
      myPersonId: data?.workspaceProjectsInfo?.myPersonId ?? null,
    };
  }

  async loadMembers(): Promise<ProjectMember[]> {
    const data = await this.query<{
      workspaceProjectMembers?: Array<{
        personId?: string | null;
        name?: string | null;
        isCoordinator?: boolean | null;
      } | null> | null;
    }>(WORKSPACE_PROJECT_MEMBERS);
    return (data?.workspaceProjectMembers ?? [])
      .filter(notNull)
      .filter(member => !!member.personId)
      .map(member => ({
        personId: member.personId!,
        name: member.name ?? null,
        isCoordinator: !!member.isCoordinator,
      }));
  }

  async loadProjects({
    view,
    text,
    pageIndex,
    pageSize,
  }: ProjectsQuery): Promise<ProjectPage> {
    const data = await this.query<{
      workspaceProjects?: {
        data?: Array<WorkspaceProjectFieldsFragment | null> | null;
        totalResults?: number | null;
      } | null;
    }>(WORKSPACE_PROJECTS, { view, text: text ?? null, pageIndex, pageSize });
    return {
      projects: (data?.workspaceProjects?.data ?? [])
        .filter(notNull)
        .filter(project => !!project._id)
        .map(mapProject),
      totalResults: data?.workspaceProjects?.totalResults ?? 0,
    };
  }

  async loadProject(projectId: string): Promise<Project> {
    const data = await this.query<{
      workspaceProjectById?: WorkspaceProjectFieldsFragment | null;
    }>(WORKSPACE_PROJECT_BY_ID, { projectId });
    const project = data?.workspaceProjectById;
    if (!project?._id) throw new ProjectsError('Project not found', 'NOT_FOUND');
    return mapProject(project);
  }

  createProject(details: ProjectDetails): Promise<Project> {
    return this.mutateProject(WORKSPACE_CREATE_PROJECT, 'workspaceCreateProject', {
      input: details,
    });
  }

  updateProject(projectId: string, details: ProjectDetails): Promise<Project> {
    return this.mutateProject(WORKSPACE_UPDATE_PROJECT, 'workspaceUpdateProject', {
      projectId,
      input: details,
    });
  }

  setProjectStatus(
    projectId: string,
    status: ProjectStatus,
    force = false
  ): Promise<Project> {
    return this.mutateProject(
      WORKSPACE_SET_PROJECT_STATUS,
      'workspaceSetProjectStatus',
      { projectId, status, force }
    );
  }

  addParticipants(projectId: string, personIds: string[]): Promise<Project> {
    return this.mutateProject(
      WORKSPACE_ADD_PROJECT_PARTICIPANTS,
      'workspaceAddProjectParticipants',
      { projectId, personIds }
    );
  }

  removeParticipant(
    projectId: string,
    personId: string,
    unassignTasks = false
  ): Promise<Project> {
    return this.mutateProject(
      WORKSPACE_REMOVE_PROJECT_PARTICIPANT,
      'workspaceRemoveProjectParticipant',
      { projectId, personId, unassignTasks }
    );
  }

  async deleteProject(projectId: string, deleteTasks = false): Promise<void> {
    await this.mutate(WORKSPACE_DELETE_PROJECT, { projectId, deleteTasks });
  }

  async loadTasks({
    view,
    projectId,
    standalone,
    assigneeId,
    priority,
    text,
    pageIndex,
    pageSize,
  }: TasksQuery): Promise<TaskPage> {
    const data = await this.query<{
      workspaceTasks?: {
        data?: Array<WorkspaceTaskFieldsFragment | null> | null;
        totalResults?: number | null;
      } | null;
    }>(WORKSPACE_TASKS, {
      view,
      projectId: projectId ?? null,
      standalone: standalone ?? null,
      assigneeId: assigneeId ?? null,
      priority: priority ?? null,
      text: text ?? null,
      pageIndex,
      pageSize,
    });
    return {
      tasks: (data?.workspaceTasks?.data ?? [])
        .filter(notNull)
        .filter(task => !!task._id)
        .map(mapTask),
      totalResults: data?.workspaceTasks?.totalResults ?? 0,
    };
  }

  async loadTask(taskId: string): Promise<Task> {
    const data = await this.query<{
      workspaceTaskById?: WorkspaceTaskFieldsFragment | null;
    }>(WORKSPACE_TASK_BY_ID, { taskId });
    const task = data?.workspaceTaskById;
    if (!task?._id) throw new ProjectsError('Task not found', 'NOT_FOUND');
    return mapTask(task);
  }

  createTask(details: TaskDetails): Promise<Task> {
    return this.mutateTask(WORKSPACE_CREATE_TASK, 'workspaceCreateTask', {
      input: details,
    });
  }

  updateTask(taskId: string, details: TaskDetails): Promise<Task> {
    return this.mutateTask(WORKSPACE_UPDATE_TASK, 'workspaceUpdateTask', {
      taskId,
      input: details,
    });
  }

  async deleteTask(taskId: string): Promise<void> {
    await this.mutate(WORKSPACE_DELETE_TASK, { taskId });
  }

  setTaskStatus(taskId: string, status: TaskStatus): Promise<Task> {
    return this.mutateTask(WORKSPACE_SET_TASK_STATUS, 'workspaceSetTaskStatus', {
      taskId,
      status,
    });
  }

  setTaskProgress(taskId: string, progress: number): Promise<Task> {
    return this.mutateTask(
      WORKSPACE_SET_TASK_PROGRESS,
      'workspaceSetTaskProgress',
      { taskId, progress }
    );
  }

  async loadComments(taskId: string): Promise<TaskComment[]> {
    const data = await this.query<{
      workspaceTaskComments?: {
        data?: Array<WorkspaceTaskCommentFieldsFragment | null> | null;
      } | null;
    }>(WORKSPACE_TASK_COMMENTS, { taskId, pageIndex: 0, pageSize: 200 });
    return (data?.workspaceTaskComments?.data ?? [])
      .filter(notNull)
      .filter(comment => !!comment._id)
      .map(mapComment);
  }

  async addComment(taskId: string, text: string): Promise<TaskComment> {
    const data = await this.mutate<{
      workspaceAddTaskComment?: WorkspaceTaskCommentFieldsFragment | null;
    }>(WORKSPACE_ADD_TASK_COMMENT, { taskId, text });
    const comment = data?.workspaceAddTaskComment;
    if (!comment?._id) throw new ProjectsError('The comment was not returned.');
    return mapComment(comment);
  }

  async deleteComment(commentId: string): Promise<void> {
    await this.mutate(WORKSPACE_DELETE_TASK_COMMENT, { commentId });
  }

  async loadActivity(
    scope: { projectId?: string; taskId?: string },
    before?: string
  ): Promise<ProjectsActivity[]> {
    const data = await this.query<{
      workspaceProjectsActivity?: Array<{
        _id?: string | null;
        action?: string | null;
        entityType?: string | null;
        entityId?: string | null;
        projectId?: string | null;
        taskId?: string | null;
        userName?: string | null;
        at?: string | null;
        details?: string | null;
      } | null> | null;
    }>(WORKSPACE_PROJECTS_ACTIVITY, {
      projectId: scope.projectId ?? null,
      taskId: scope.taskId ?? null,
      before: before ?? null,
      limit: 50,
    });
    return (data?.workspaceProjectsActivity ?? []).filter(notNull).map(entry => ({
      _id: entry._id ?? '',
      action: entry.action ?? '',
      entityType: entry.entityType ?? null,
      entityId: entry.entityId ?? null,
      projectId: entry.projectId ?? null,
      taskId: entry.taskId ?? null,
      userName: entry.userName ?? null,
      at: entry.at ?? null,
      details: parseDetails(entry.details),
    }));
  }
}
