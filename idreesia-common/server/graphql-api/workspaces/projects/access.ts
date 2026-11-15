import { GraphQLError } from 'graphql';

import {
  getProject,
  getTask,
} from 'meteor/idreesia-common/server/business-logic/projects';
import {
  areCommitteeMembers,
  getCommitteeProjectsWorkspaceId,
  type CommitteeDoc,
  type ProjectsContext,
} from 'meteor/idreesia-common/server/business-logic/hr/committee';

import { CommitteeMemberRoles } from 'meteor/idreesia-common/constants/organization';

import {
  getCommitteeAccess,
  type CommitteeAccessContext,
} from '../committee/access';

export interface ProjectsAccess extends ProjectsContext {
  /**
   * A guest sees and acts only in the projects they take part in, and in
   * those projects' tasks. In those they have the same rights as a member.
   */
  isGuest: boolean;
}

const forbidden = (message: string) =>
  new GraphQLError(message, { extensions: { code: 'FORBIDDEN' } });

const notFound = (message: string) =>
  new GraphQLError(message, { extensions: { code: 'NOT_FOUND' } });

/**
 * What a projects resolver works with, built from what
 * `@checkCommitteeAccess` found: who may call the field is decided by the
 * directive in the schema. Here the committee must also have Projects & Tasks
 * enabled.
 */
export const getProjectsAccess = (
  context: CommitteeAccessContext,
  committeeId: string
): ProjectsAccess => {
  const { committee, role, isCoordinator } = getCommitteeAccess(
    context,
    committeeId
  );
  const { user } = context;
  if (!user?._id) {
    throw forbidden('You are not a member of this committee.');
  }
  return {
    workspaceId: getCommitteeProjectsWorkspaceId(
      committee as unknown as CommitteeDoc
    ),
    committee: committee as unknown as CommitteeDoc,
    userId: user._id,
    personId: user.personId ?? null,
    isCoordinator,
    isGuest: role === CommitteeMemberRoles.GUEST,
  };
};

/**
 * The person id to narrow project and task lists to: a guest's own, since
 * they only see projects they take part in. Undefined for everyone else.
 */
export const guestParticipantId = (access: ProjectsAccess) =>
  access.isGuest ? access.personId ?? '-' : undefined;

const takesPart = (
  access: ProjectsAccess,
  project: { participantIds: string[] }
) => !!access.personId && project.participantIds.includes(access.personId);

/**
 * The projects module takes ids on their own, so each id from the client is
 * checked to belong to the committee's workspace before it is acted on. A
 * guest also has to take part in the project.
 */
export const assertProjectInWorkspace = async (
  access: ProjectsAccess,
  projectId: string
) => {
  const project = await getProject(projectId, access.userId);
  if (
    project.workspaceId !== access.workspaceId ||
    (access.isGuest && !takesPart(access, project))
  ) {
    throw notFound('Project not found');
  }
  return project;
};

/**
 * The task, and its project when it has one. A guest only gets the tasks of
 * projects they take part in.
 */
export const assertTaskInWorkspace = async (
  access: ProjectsAccess,
  taskId: string
) => {
  const task = await getTask(taskId, access.userId);
  if (task.workspaceId !== access.workspaceId) {
    throw notFound('Task not found');
  }
  const project = task.projectId
    ? await getProject(task.projectId, access.userId)
    : undefined;
  if (project && project.workspaceId !== access.workspaceId) {
    throw notFound('Project not found');
  }
  if (access.isGuest && !(project && takesPart(access, project))) {
    throw notFound('Task not found');
  }
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
