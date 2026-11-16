import {
  addTaskComment,
  deleteTask,
  deleteTaskComment,
  getTaskComment,
  setTaskProgress,
  setTaskStatus,
} from 'meteor/idreesia-common/server/business-logic/projects';
import {
  addCommitteeProjectParticipants,
  createCommitteeProject,
  createCommitteeTask,
  deleteCommitteeProject,
  getCommitteeProject,
  getCommitteeProjectMembers,
  getCommitteeProjectsActivity,
  getCommitteeProjectsInfo,
  getCommitteeTask,
  getPeopleInProjectsOf,
  listCommitteeProjects,
  listCommitteeTaskComments,
  listCommitteeTasks,
  mapComments,
  removeCommitteeProjectParticipant,
  setCommitteeProjectStatus,
  toCommitteeProject,
  toCommitteeTask,
  updateCommitteeProject,
  updateCommitteeTask,
  type CommitteeProjectInput,
  type CommitteeTaskInput,
  type ProjectsView,
  type TasksView,
} from 'meteor/idreesia-common/server/business-logic/hr/committee';

import { GraphQLError } from 'graphql';

import {
  assertCoordinator,
  assertMembers,
  assertProjectInWorkspace,
  assertTaskInWorkspace,
  getProjectsAccess,
  guestParticipantId,
  type ProjectsAccess,
} from './access';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

/** Participants in the input must be members. */
const checkProjectInput = (
  access: ProjectsAccess,
  input: CommitteeProjectInput
) => {
  const participantIds = (input.participantIds ?? []).filter(Boolean);
  assertMembers(access, participantIds);
  return { ...input, participantIds };
};

const checkTaskInput = (access: ProjectsAccess, input: CommitteeTaskInput) => {
  if (input.assigneeId) assertMembers(access, [input.assigneeId]);
  return input;
};

/** A project of the committee, for a coordinator. */
const managedProject = async (
  context: unknown,
  committeeId: string,
  projectId: string
) => {
  const access = getProjectsAccess(context as any, committeeId);
  const project = await assertProjectInWorkspace(access, projectId);
  return { access, project };
};

/** A task of the committee, for a coordinator. */
const managedTask = async (
  context: unknown,
  committeeId: string,
  taskId: string
) => {
  const access = getProjectsAccess(context as any, committeeId);
  const { task, project } = await assertTaskInWorkspace(access, taskId);
  return { access, task, project };
};

/** A task whose status/progress the user may change: coordinators, or the assignee. */
const updatableTask = async (
  context: unknown,
  committeeId: string,
  taskId: string
) => {
  const access = getProjectsAccess(context as any, committeeId);
  const { task, project } = await assertTaskInWorkspace(access, taskId);
  const isAssignee = !!access.personId && task.assigneeId === access.personId;
  if (!isAssignee) assertCoordinator(access);
  return { access, task, project };
};

// Who may call each field (committee role) is declared in the schema with
// @checkCommitteeAccess. The resolvers only check what the role cannot tell:
// Projects enabled on the committee; assignees updating their own task; ids
// belonging to the committee's workspace; a guest taking part in the project;
// participants and assignees being committee members.
// The projects module and the committee projects logic do the work, and the
// module enforces the status rules and progress.
const resolvers: ResolverMap = {
  Query: {
    workspaceProjectsInfo: async (obj, { committeeId }, context) => {
      const access = getProjectsAccess(context, committeeId);
      return getCommitteeProjectsInfo(access);
    },

    workspaceProjectMembers: async (obj, { committeeId }, context) => {
      const access = getProjectsAccess(context, committeeId);
      return getCommitteeProjectMembers(
        access.committee,
        access.isGuest
          ? await getPeopleInProjectsOf(access.workspaceId, access.personId)
          : undefined
      );
    },

    workspaceProjects: async (
      obj,
      { committeeId, view, text, pageIndex, pageSize },
      context
    ) => {
      const access = getProjectsAccess(context, committeeId);
      return listCommitteeProjects(access.workspaceId, access, {
        view: view as ProjectsView | null,
        participantId: guestParticipantId(access),
        text,
        pageIndex,
        pageSize,
      });
    },

    workspaceProjectById: async (obj, { committeeId, projectId }, context) => {
      const access = getProjectsAccess(context, committeeId);
      await assertProjectInWorkspace(access, projectId);
      return getCommitteeProject(projectId, access);
    },

    workspaceTasks: async (
      obj,
      {
        committeeId,
        view,
        projectId,
        standalone,
        assigneeId,
        priority,
        text,
        pageIndex,
        pageSize,
      },
      context
    ) => {
      const access = getProjectsAccess(context, committeeId);
      if (projectId) await assertProjectInWorkspace(access, projectId);
      return listCommitteeTasks(access.workspaceId, access, {
        view: view as TasksView | null,
        projectId,
        participantId: guestParticipantId(access),
        standalone,
        assigneeId,
        priority,
        text,
        pageIndex,
        pageSize,
      });
    },

    workspaceTaskById: async (obj, { committeeId, taskId }, context) => {
      const access = getProjectsAccess(context, committeeId);
      await assertTaskInWorkspace(access, taskId);
      return getCommitteeTask(taskId, access);
    },

    workspaceTaskComments: async (
      obj,
      { committeeId, taskId, pageIndex, pageSize },
      context
    ) => {
      const access = getProjectsAccess(context, committeeId);
      await assertTaskInWorkspace(access, taskId);
      return listCommitteeTaskComments(taskId, access, { pageIndex, pageSize });
    },

    workspaceProjectsActivity: async (
      obj,
      { committeeId, projectId, taskId, before, limit },
      context
    ) => {
      const access = getProjectsAccess(context, committeeId);
      if (projectId) await assertProjectInWorkspace(access, projectId);
      if (taskId) await assertTaskInWorkspace(access, taskId);
      return getCommitteeProjectsActivity(access.workspaceId, access, {
        projectId,
        taskId,
        before,
        limit,
      });
    },

  },

  Mutation: {
    workspaceCreateProject: async (obj, { committeeId, input }, context) => {
      const access = getProjectsAccess(context, committeeId);
      const project = await createCommitteeProject(
        access.workspaceId,
        checkProjectInput(access, input),
        access.userId
      );
      return toCommitteeProject(project, access);
    },

    workspaceUpdateProject: async (
      obj,
      { committeeId, projectId, input },
      context
    ) => {
      const { access, project } = await managedProject(context,
        committeeId,
        projectId
      );
      return toCommitteeProject(
        await updateCommitteeProject(
          project,
          checkProjectInput(access, input),
          access.userId
        ),
        access
      );
    },

    workspaceSetProjectStatus: async (
      obj,
      { committeeId, projectId, status, force },
      context
    ) => {
      const { access } = await managedProject(context, committeeId, projectId);
      return toCommitteeProject(
        await setCommitteeProjectStatus(
          projectId,
          status,
          !!force,
          access.userId
        ),
        access
      );
    },

    workspaceAddProjectParticipants: async (
      obj,
      { committeeId, projectId, personIds },
      context
    ) => {
      const { access, project } = await managedProject(context,
        committeeId,
        projectId
      );
      const ids = (personIds as string[]).filter(Boolean);
      assertMembers(access, ids);
      return toCommitteeProject(
        await addCommitteeProjectParticipants(project, ids, access.userId),
        access
      );
    },

    workspaceRemoveProjectParticipant: async (
      obj,
      { committeeId, projectId, personId, unassignTasks },
      context
    ) => {
      const { access, project } = await managedProject(context,
        committeeId,
        projectId
      );
      return toCommitteeProject(
        await removeCommitteeProjectParticipant(
          project,
          personId,
          !!unassignTasks,
          access.userId
        ),
        access
      );
    },

    workspaceDeleteProject: async (
      obj,
      { committeeId, projectId, deleteTasks },
      context
    ) => {
      const access = getProjectsAccess(context, committeeId);
      const project = await assertProjectInWorkspace(access, projectId);
      await deleteCommitteeProject(
        project,
        { tasks: deleteTasks ? 'delete' : 'detach' },
        access.userId
      );
      return true;
    },

    workspaceCreateTask: async (obj, { committeeId, input }, context) => {
      const access = getProjectsAccess(context, committeeId);
      const project = input.projectId
        ? await assertProjectInWorkspace(access, input.projectId)
        : undefined;
      const task = await createCommitteeTask(
        access.workspaceId,
        project,
        checkTaskInput(access, input),
        access.userId
      );
      return toCommitteeTask(task, access);
    },

    workspaceUpdateTask: async (
      obj,
      { committeeId, taskId, input },
      context
    ) => {
      const { access, task, project } = await managedTask(context,
        committeeId,
        taskId
      );
      return toCommitteeTask(
        await updateCommitteeTask(
          task,
          project,
          checkTaskInput(access, input),
          access.userId
        ),
        access
      );
    },

    workspaceDeleteTask: async (obj, { committeeId, taskId }, context) => {
      const { access } = await managedTask(context, committeeId, taskId);
      await deleteTask(taskId, access.userId);
      return true;
    },

    workspaceSetTaskStatus: async (
      obj,
      { committeeId, taskId, status },
      context
    ) => {
      const { access } = await updatableTask(context, committeeId, taskId);
      return toCommitteeTask(
        await setTaskStatus(taskId, status, access.userId),
        access
      );
    },

    workspaceSetTaskProgress: async (
      obj,
      { committeeId, taskId, progress },
      context
    ) => {
      const { access } = await updatableTask(context, committeeId, taskId);
      return toCommitteeTask(
        await setTaskProgress(taskId, progress, access.userId),
        access
      );
    },

    workspaceAddTaskComment: async (
      obj,
      { committeeId, taskId, text },
      context
    ) => {
      const access = getProjectsAccess(context, committeeId);
      await assertTaskInWorkspace(access, taskId);
      const comment = await addTaskComment(taskId, text, access.userId);
      return (await mapComments([comment], access))[0];
    },

    workspaceDeleteTaskComment: async (
      obj,
      { committeeId, commentId },
      context
    ) => {
      const access = getProjectsAccess(context, committeeId);
      const comment = await getTaskComment(commentId, access.userId);
      await assertTaskInWorkspace(access, comment.taskId);
      if (!access.isCoordinator && comment.authorId !== access.userId) {
        throw new GraphQLError('You can only delete your own comments.', {
          extensions: { code: 'FORBIDDEN' },
        });
      }
      await deleteTaskComment(commentId, access.userId);
      return true;
    },

  },
};

export default resolvers;
