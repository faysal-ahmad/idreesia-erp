import { GraphQLError } from 'graphql';

import { ProjectStatus } from 'meteor/idreesia-common/constants/projects';
import {
  getProject,
  setProjectChatGroupId,
} from 'meteor/idreesia-common/server/business-logic/projects';
import { Users } from 'meteor/idreesia-common/server/collections/admin';
import type { ProjectDocument } from 'meteor/idreesia-common/server/collections/projects';
import {
  addChatGroupMembers,
  archiveChatGroup,
  createChatGroup,
  findChatGroup,
  removeChatGroupMember,
  unarchiveChatGroup,
} from 'meteor/idreesia-common/server/chat';

import type { CommitteeDoc } from './types';

/*
 * Each project has a private chat group for its participants. The projects
 * module knows nothing about chat (it only stores the group id); this file
 * keeps the group in step with the project. Group membership = the
 * participants who have a chat account. Coordinators get no automatic access.
 * Completed and cancelled projects have their group archived.
 */

// Chat room names allow letters, digits, '-', '_' and '.', and must be unique.
const chatGroupName = (committee: CommitteeDoc, project: ProjectDocument) => {
  const slug = (str: string) =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  return `project-${slug(committee.name) || 'committee'}-${
    slug(project.title).slice(0, 30) || 'project'
  }-${project._id.slice(-6).toLowerCase()}`;
};

const chatUserIdsOf = async (personIds: string[]) => {
  if (!personIds.length) return [];
  const users = await Users.findByPersonIds(personIds);
  return users
    .map(user => user.chatUserId as string | undefined)
    .filter((chatUserId): chatUserId is string => !!chatUserId);
};

const isClosed = (project: Pick<ProjectDocument, 'status'>) =>
  project.status === ProjectStatus.COMPLETED ||
  project.status === ProjectStatus.CANCELLED;

/**
 * The project's chat group id, creating the group first when the project has
 * none (or its group was removed). A group of an open project is unarchived.
 * Participants are added.
 */
export async function ensureProjectChatGroup(
  committee: CommitteeDoc,
  project: ProjectDocument,
  userId: string
): Promise<string> {
  let group = project.chatGroupId
    ? await findChatGroup(project.chatGroupId)
    : null;

  if (!group) {
    group = await createChatGroup(chatGroupName(committee, project));
    await setProjectChatGroupId(project._id, group._id, userId);
  } else if (group.archived && !isClosed(project)) {
    await unarchiveChatGroup(group._id);
  }

  await addChatGroupMembers(
    group._id,
    await chatUserIdsOf(project.participantIds)
  );
  return group._id;
}

/** Creates the chat group without failing the caller if chat is down. */
export async function tryEnsureProjectChatGroup(
  committee: CommitteeDoc,
  project: ProjectDocument,
  userId: string
) {
  try {
    await ensureProjectChatGroup(committee, project, userId);
  } catch (error) {
    // The group is created when the chat is first opened.
    // eslint-disable-next-line no-console
    console.error('[projects] Could not create the project chat group', error);
  }
}

/** Adds people to the project's chat group (if it has one). */
export async function addProjectChatMembers(
  project: ProjectDocument,
  personIds: string[]
) {
  if (!project.chatGroupId) return;
  await addChatGroupMembers(project.chatGroupId, await chatUserIdsOf(personIds));
}

/** Removes a person from the project's chat group (if it has one). */
export async function removeProjectChatMember(
  project: ProjectDocument,
  personId: string
) {
  if (!project.chatGroupId) return;
  const [chatUserId] = await chatUserIdsOf([personId]);
  if (chatUserId) await removeChatGroupMember(project.chatGroupId, chatUserId);
}

/** Archives (closed project) or unarchives (open project) the group. */
export async function syncProjectChatArchive(project: ProjectDocument) {
  if (!project.chatGroupId) return;
  const group = await findChatGroup(project.chatGroupId);
  if (!group) return;
  if (isClosed(project) && !group.archived) await archiveChatGroup(group._id);
  if (!isClosed(project) && group.archived) await unarchiveChatGroup(group._id);
}

/** Archives the group regardless of status (feature off, project deleted). */
export async function archiveProjectChat(project: ProjectDocument) {
  if (!project.chatGroupId) return;
  const group = await findChatGroup(project.chatGroupId);
  if (group && !group.archived) await archiveChatGroup(group._id);
}

/**
 * The chat group of a project for a participant. Only participants may use
 * it - coordinators and erp-admin must be participants too. The group is
 * created on first use if needed.
 */
export async function getProjectChatGroupId(
  committee: CommitteeDoc,
  projectId: string,
  context: { userId: string; personId: string | null }
): Promise<string> {
  const project = await getProject(projectId, context.userId);
  if (!context.personId || !project.participantIds.includes(context.personId)) {
    throw new GraphQLError('You are not a participant of this project.', {
      extensions: { code: 'FORBIDDEN' },
    });
  }
  if (project.chatGroupId) return project.chatGroupId;
  return ensureProjectChatGroup(committee, project, context.userId);
}
