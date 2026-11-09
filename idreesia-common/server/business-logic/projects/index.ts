/**
 * Headless projects and tasks module: workspaces of projects and tasks. A
 * project has an objective, participants and a set of tasks whose
 * progress it summarises; a task has one assignee, a due date, a status and
 * a progress value, and can be standalone or part of a project.
 *
 * Callers enforce access - nothing here checks whether a user may see or
 * change a workspace, project or task. Every function takes the acting
 * user's id, which is recorded on changes and in the activity log. Participant,
 * assignee and author ids are opaque to the module. The module
 * enforces its own rules: status transitions, progress, assignees being
 * project participants, and closed projects being read-only. Errors are
 * GraphQLErrors with an `extensions.code` (see ProjectsErrorCode).
 */
export type { ProjectsErrorCode } from './errors';
export type {
  ProjectsPage,
  ProjectsPageOptions,
  ProjectsSortOrder,
} from './internal';

export { listProjectsActivity } from './activity';
export type { ListProjectsActivityOptions } from './activity';

export {
  createProjectsWorkspace,
  updateProjectsWorkspace,
  getProjectsWorkspace,
  listProjectsWorkspaces,
  deleteProjectsWorkspace,
  restoreProjectsWorkspace,
  purgeProjectsWorkspace,
} from './workspaces';
export type {
  CreateProjectsWorkspaceInput,
  UpdateProjectsWorkspaceInput,
  ListProjectsWorkspacesOptions,
} from './workspaces';

export {
  createProject,
  getProject,
  updateProject,
  setProjectStatus,
  addProjectParticipants,
  removeProjectParticipant,
  setProjectChatGroupId,
  deleteProject,
  listProjects,
  listParticipantProjects,
} from './projects';
export type {
  CreateProjectInput,
  UpdateProjectInput,
  SetProjectStatusOptions,
  RemoveProjectParticipantOptions,
  DeleteProjectOptions,
  ListProjectsOptions,
  ListParticipantProjectsOptions,
} from './projects';

export {
  createTask,
  getTask,
  updateTask,
  setTaskStatus,
  setTaskProgress,
  deleteTask,
  listTasks,
  listAssigneeTasks,
  isTaskOverdue,
} from './tasks';
export type {
  CreateTaskInput,
  UpdateTaskInput,
  ListTasksOptions,
  ListAssigneeTasksOptions,
} from './tasks';

export {
  addTaskComment,
  getTaskComment,
  deleteTaskComment,
  listTaskComments,
} from './comments';

export { PROJECTS_MODULE } from 'meteor/idreesia-common/constants/projects';
export { projectsModule } from './module';
