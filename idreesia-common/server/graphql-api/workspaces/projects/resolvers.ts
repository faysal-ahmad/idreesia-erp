import {
  addTaskComment,
  deleteTask,
  deleteTaskComment,
  getTaskComment,
  setTaskProgress,
  setTaskStatus,
} from 'meteor/idreesia-common/server/business-logic/projects';
import {
  deleteConversationMessage,
  editConversationMessage,
  getConversationInfo,
  getConversationMembers,
  getConversationPinnedMessages,
  getConversationStarredMessages,
  getConversationThreadMessages,
  getOlderConversationMessages,
  reactToConversationMessage,
  searchConversationMessages,
  sendConversationMessage,
  setConversationMessagePinned,
  setConversationMessageStarred,
  syncConversationMessages,
} from 'meteor/idreesia-common/server/business-logic/rocket-chat';
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
  getProjectChatAccess,
  getProjectsAccess,
  projectDiscussionFileUrl,
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
  user: unknown,
  committeeId: string,
  projectId: string
) => {
  const access = await getProjectsAccess(user as any, committeeId, {
    coordinator: true,
  });
  const project = await assertProjectInWorkspace(access, projectId);
  return { access, project };
};

/** A task of the committee, for a coordinator. */
const managedTask = async (
  user: unknown,
  committeeId: string,
  taskId: string
) => {
  const access = await getProjectsAccess(user as any, committeeId, {
    coordinator: true,
  });
  const { task, project } = await assertTaskInWorkspace(access, taskId);
  return { access, task, project };
};

/** A task whose status/progress the user may change: coordinators, or the assignee. */
const updatableTask = async (
  user: unknown,
  committeeId: string,
  taskId: string
) => {
  const access = await getProjectsAccess(user as any, committeeId);
  const { task, project } = await assertTaskInWorkspace(access, taskId);
  const isAssignee = !!access.personId && task.assigneeId === access.personId;
  if (!isAssignee) assertCoordinator(access);
  return { access, task, project };
};

// Each resolver only checks access - committee membership + Projects enabled;
// coordinators for creating and changing projects and tasks; assignees for
// updating their own task; ids belonging to the committee's workspace;
// participants and assignees being committee members; and the project chat
// being for participants only.
// The projects module and the committee projects logic do the work, and the
// module enforces the status rules and progress.
const resolvers: ResolverMap = {
  Query: {
    workspaceProjectsInfo: async (obj, { committeeId }, { user }) => {
      const access = await getProjectsAccess(user, committeeId);
      return getCommitteeProjectsInfo(access);
    },

    workspaceProjectMembers: async (obj, { committeeId }, { user }) => {
      const access = await getProjectsAccess(user, committeeId);
      return getCommitteeProjectMembers(access.committee);
    },

    workspaceProjects: async (
      obj,
      { committeeId, view, text, pageIndex, pageSize },
      { user }
    ) => {
      const access = await getProjectsAccess(user, committeeId);
      return listCommitteeProjects(access.workspaceId, access, {
        view: view as ProjectsView | null,
        text,
        pageIndex,
        pageSize,
      });
    },

    workspaceProjectById: async (obj, { committeeId, projectId }, { user }) => {
      const access = await getProjectsAccess(user, committeeId);
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
      { user }
    ) => {
      const access = await getProjectsAccess(user, committeeId);
      if (projectId) await assertProjectInWorkspace(access, projectId);
      return listCommitteeTasks(access.workspaceId, access, {
        view: view as TasksView | null,
        projectId,
        standalone,
        assigneeId,
        priority,
        text,
        pageIndex,
        pageSize,
      });
    },

    workspaceTaskById: async (obj, { committeeId, taskId }, { user }) => {
      const access = await getProjectsAccess(user, committeeId);
      await assertTaskInWorkspace(access, taskId);
      return getCommitteeTask(taskId, access);
    },

    workspaceTaskComments: async (
      obj,
      { committeeId, taskId, pageIndex, pageSize },
      { user }
    ) => {
      const access = await getProjectsAccess(user, committeeId);
      await assertTaskInWorkspace(access, taskId);
      return listCommitteeTaskComments(taskId, access, { pageIndex, pageSize });
    },

    workspaceProjectsActivity: async (
      obj,
      { committeeId, projectId, taskId, before, limit },
      { user }
    ) => {
      const access = await getProjectsAccess(user, committeeId, {
        coordinator: true,
      });
      if (projectId) await assertProjectInWorkspace(access, projectId);
      if (taskId) await assertTaskInWorkspace(access, taskId);
      return getCommitteeProjectsActivity(access.workspaceId, access, {
        projectId,
        taskId,
        before,
        limit,
      });
    },

    workspaceProjectDiscussionInfo: async (
      obj,
      { committeeId, projectId },
      { user }
    ) => {
      const { access } = await getProjectChatAccess(
        user,
        committeeId,
        projectId
      );
      return {
        ...getConversationInfo(user),
        canPin: access.isCoordinator,
      };
    },

    workspaceProjectDiscussionSync: async (
      obj,
      { committeeId, projectId, since },
      { user }
    ) => {
      const { chatGroupId } = await getProjectChatAccess(
        user,
        committeeId,
        projectId
      );
      return syncConversationMessages(chatGroupId, user, {
        since,
        fileUrl: projectDiscussionFileUrl(committeeId, projectId),
      });
    },

    workspaceProjectDiscussionThreadMessages: async (
      obj,
      { committeeId, projectId, threadId },
      { user }
    ) => {
      const { chatGroupId } = await getProjectChatAccess(
        user,
        committeeId,
        projectId
      );
      return getConversationThreadMessages(chatGroupId, user, threadId, {
        fileUrl: projectDiscussionFileUrl(committeeId, projectId),
      });
    },

    workspaceProjectDiscussionMembers: async (
      obj,
      { committeeId, projectId },
      { user }
    ) => {
      const { chatGroupId } = await getProjectChatAccess(
        user,
        committeeId,
        projectId
      );
      return getConversationMembers(chatGroupId);
    },

    workspaceProjectDiscussionPinnedMessages: async (
      obj,
      { committeeId, projectId },
      { user }
    ) => {
      const { chatGroupId } = await getProjectChatAccess(
        user,
        committeeId,
        projectId
      );
      return getConversationPinnedMessages(chatGroupId, user, {
        fileUrl: projectDiscussionFileUrl(committeeId, projectId),
      });
    },

    workspaceProjectDiscussionStarredMessages: async (
      obj,
      { committeeId, projectId },
      { user }
    ) => {
      const { chatGroupId } = await getProjectChatAccess(
        user,
        committeeId,
        projectId
      );
      return getConversationStarredMessages(chatGroupId, user, {
        fileUrl: projectDiscussionFileUrl(committeeId, projectId),
      });
    },

    workspaceProjectDiscussionOlderMessages: async (
      obj,
      { committeeId, projectId, before },
      { user }
    ) => {
      const { chatGroupId } = await getProjectChatAccess(
        user,
        committeeId,
        projectId
      );
      return getOlderConversationMessages(chatGroupId, user, {
        before,
        fileUrl: projectDiscussionFileUrl(committeeId, projectId),
      });
    },

    workspaceProjectDiscussionSearchMessages: async (
      obj,
      { committeeId, projectId, searchText, offset },
      { user }
    ) => {
      const { chatGroupId } = await getProjectChatAccess(
        user,
        committeeId,
        projectId
      );
      return searchConversationMessages(chatGroupId, user, {
        searchText,
        offset,
        fileUrl: projectDiscussionFileUrl(committeeId, projectId),
      });
    },
  },

  Mutation: {
    workspaceCreateProject: async (obj, { committeeId, input }, { user }) => {
      const access = await getProjectsAccess(user, committeeId, {
        coordinator: true,
      });
      const project = await createCommitteeProject(
        access.committee,
        access.workspaceId,
        checkProjectInput(access, input),
        access.userId
      );
      return toCommitteeProject(project, access);
    },

    workspaceUpdateProject: async (
      obj,
      { committeeId, projectId, input },
      { user }
    ) => {
      const { access, project } = await managedProject(
        user,
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
      { user }
    ) => {
      const { access } = await managedProject(user, committeeId, projectId);
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
      { user }
    ) => {
      const { access, project } = await managedProject(
        user,
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
      { user }
    ) => {
      const { access, project } = await managedProject(
        user,
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
      { user }
    ) => {
      const access = await getProjectsAccess(user, committeeId, {
        coordinator: true,
      });
      const project = await assertProjectInWorkspace(access, projectId);
      await deleteCommitteeProject(
        project,
        { tasks: deleteTasks ? 'delete' : 'detach' },
        access.userId
      );
      return true;
    },

    workspaceCreateTask: async (obj, { committeeId, input }, { user }) => {
      const access = await getProjectsAccess(user, committeeId, {
        coordinator: true,
      });
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
      { user }
    ) => {
      const { access, task, project } = await managedTask(
        user,
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

    workspaceDeleteTask: async (obj, { committeeId, taskId }, { user }) => {
      const { access } = await managedTask(user, committeeId, taskId);
      await deleteTask(taskId, access.userId);
      return true;
    },

    workspaceSetTaskStatus: async (
      obj,
      { committeeId, taskId, status },
      { user }
    ) => {
      const { access } = await updatableTask(user, committeeId, taskId);
      return toCommitteeTask(
        await setTaskStatus(taskId, status, access.userId),
        access
      );
    },

    workspaceSetTaskProgress: async (
      obj,
      { committeeId, taskId, progress },
      { user }
    ) => {
      const { access } = await updatableTask(user, committeeId, taskId);
      return toCommitteeTask(
        await setTaskProgress(taskId, progress, access.userId),
        access
      );
    },

    workspaceAddTaskComment: async (
      obj,
      { committeeId, taskId, text },
      { user }
    ) => {
      const access = await getProjectsAccess(user, committeeId);
      await assertTaskInWorkspace(access, taskId);
      const comment = await addTaskComment(taskId, text, access.userId);
      return (await mapComments([comment], access))[0];
    },

    workspaceDeleteTaskComment: async (
      obj,
      { committeeId, commentId },
      { user }
    ) => {
      const access = await getProjectsAccess(user, committeeId);
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

    workspaceSendProjectDiscussionMessage: async (
      obj,
      { committeeId, projectId, text, threadId },
      { user }
    ) => {
      const { chatGroupId } = await getProjectChatAccess(
        user,
        committeeId,
        projectId
      );
      return sendConversationMessage(chatGroupId, user, text, threadId);
    },

    workspaceReactToProjectDiscussionMessage: async (
      obj,
      { committeeId, projectId, messageId, emoji, shouldReact },
      { user }
    ) => {
      const { chatGroupId } = await getProjectChatAccess(
        user,
        committeeId,
        projectId
      );
      return reactToConversationMessage(
        chatGroupId,
        user,
        messageId,
        emoji,
        shouldReact
      );
    },

    workspaceSetProjectDiscussionMessageStarred: async (
      obj,
      { committeeId, projectId, messageId, starred },
      { user }
    ) => {
      const { chatGroupId } = await getProjectChatAccess(
        user,
        committeeId,
        projectId
      );
      return setConversationMessageStarred(chatGroupId, user, messageId, starred);
    },

    workspaceSetProjectDiscussionMessagePinned: async (
      obj,
      { committeeId, projectId, messageId, pinned },
      { user }
    ) => {
      const { access, chatGroupId } = await getProjectChatAccess(
        user,
        committeeId,
        projectId
      );
      assertCoordinator(access);
      return setConversationMessagePinned(chatGroupId, messageId, pinned);
    },

    workspaceEditProjectDiscussionMessage: async (
      obj,
      { committeeId, projectId, messageId, text },
      { user }
    ) => {
      const { chatGroupId } = await getProjectChatAccess(
        user,
        committeeId,
        projectId
      );
      return editConversationMessage(chatGroupId, user, messageId, text);
    },

    workspaceDeleteProjectDiscussionMessage: async (
      obj,
      { committeeId, projectId, messageId },
      { user }
    ) => {
      const { chatGroupId } = await getProjectChatAccess(
        user,
        committeeId,
        projectId
      );
      return deleteConversationMessage(chatGroupId, user, messageId);
    },
  },
};

export default resolvers;
