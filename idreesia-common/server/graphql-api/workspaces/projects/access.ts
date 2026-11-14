import { GraphQLError } from 'graphql';

import {
  getProject,
  getTask,
} from 'meteor/idreesia-common/server/business-logic/projects';
import {
  areCommitteeMembers,
  getCommitteeProjectsWorkspaceId,
  getProjectChatGroupId,
  type CommitteeDoc,
  type ProjectsContext,
} from 'meteor/idreesia-common/server/business-logic/hr/committee';

import {
  getMemberCommittee,
  isCommitteeCoordinator,
  type WorkspaceUser,
} from '../committee/access';

export type ProjectsAccess = ProjectsContext;

const forbidden = (message: string) =>
  new GraphQLError(message, { extensions: { code: 'FORBIDDEN' } });

const notFound = (message: string) =>
  new GraphQLError(message, { extensions: { code: 'NOT_FOUND' } });

/**
 * Permission check for a committee's projects: the user must be a member of
 * the committee (erp-admin counts as one), and the committee must have
 * Projects & Tasks enabled. With `coordinator`, only its coordinators pass.
 */
export const getProjectsAccess = async (
  user: WorkspaceUser | null | undefined,
  committeeId: string,
  { coordinator = false }: { coordinator?: boolean } = {}
): Promise<ProjectsAccess> => {
  const committee = await getMemberCommittee(user, committeeId);
  if (!committee || !user?._id) {
    throw forbidden('You are not a member of this committee.');
  }
  const workspaceId = getCommitteeProjectsWorkspaceId(
    committee as unknown as CommitteeDoc
  );
  const isCoordinator = isCommitteeCoordinator(user, committee);
  if (coordinator && !isCoordinator) {
    throw forbidden('Only coordinators of this committee can do this.');
  }
  return {
    workspaceId,
    committee: committee as unknown as CommitteeDoc,
    userId: user._id,
    personId: user.personId ?? null,
    isCoordinator,
  };
};

/**
 * The projects module takes ids on their own, so each id from the client is
 * checked to belong to the committee's workspace before it is acted on.
 */
export const assertProjectInWorkspace = async (
  access: ProjectsAccess,
  projectId: string
) => {
  const project = await getProject(projectId, access.userId);
  if (project.workspaceId !== access.workspaceId) {
    throw notFound('Project not found');
  }
  return project;
};

/** The task, and its project when it has one. */
export const assertTaskInWorkspace = async (
  access: ProjectsAccess,
  taskId: string
) => {
  const task = await getTask(taskId, access.userId);
  if (task.workspaceId !== access.workspaceId) {
    throw notFound('Task not found');
  }
  const project = task.projectId
    ? await assertProjectInWorkspace(access, task.projectId)
    : undefined;
  return { task, project };
};

/** Only coordinators manage projects and tasks. */
export const assertCoordinator = (access: ProjectsAccess) => {
  if (!access.isCoordinator) {
    throw forbidden('Only coordinators of this committee can do this.');
  }
};

/** Participants and assignees must be committee members. */
export const assertMembers = (access: ProjectsAccess, personIds: string[]) => {
  if (!areCommitteeMembers(access.committee, personIds)) {
    throw new GraphQLError('Only members of this committee can be chosen.', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }
};

/**
 * Access to a project's chat: the user must be a participant of the project
 * (coordinators and erp-admin included - the chat is private). Returns the
 * chat group to hand to the discussions business logic. Shared by the GraphQL
 * resolvers and the file routes.
 */
export const getProjectChatAccess = async (
  user: WorkspaceUser | null | undefined,
  committeeId: string,
  projectId: string
) => {
  const access = await getProjectsAccess(user, committeeId);
  const project = await assertProjectInWorkspace(access, projectId);
  const chatGroupId = await getProjectChatGroupId(
    access.committee,
    projectId,
    access
  );
  return { access, project, chatGroupId };
};

/** The ERP file route for a project chat's uploads. */
export const projectDiscussionFileUrl =
  (committeeId: string, projectId: string) =>
  (fileId: string, fileName: string) =>
    `/api/workspaces/committees/${committeeId}/projects/${projectId}/discussions/files/${fileId}/${fileName}`;
