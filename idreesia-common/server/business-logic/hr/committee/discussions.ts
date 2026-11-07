import { GraphQLError } from 'graphql';

import { CommitteeFeatureKeys } from 'meteor/idreesia-common/constants/hr';
import { Users } from 'meteor/idreesia-common/server/collections/admin';
import {
  addChatGroupMembers,
  archiveChatGroup,
  createChatGroup,
  findChatGroup,
  getChatGroupMemberIds,
  removeChatGroupMember,
  unarchiveChatGroup,
} from 'meteor/idreesia-common/server/chat';

import type { CommitteeDoc, CommitteeFeatureHandler } from './types';

// Rocket.Chat room names only allow letters, digits, '-', '_' and '.', and
// must be unique. The committee id suffix keeps two committees with similar
// names apart.
const chatGroupName = (committee: CommitteeDoc) => {
  const slug = committee.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `committee-${slug || 'group'}-${committee._id.slice(-6).toLowerCase()}`;
};

// Chat user ids of the committee members. Members are karkuns (people);
// only those with an ERP user that has a chat account can join.
const memberChatUserIds = async (committee: CommitteeDoc) => {
  const personIds = (committee.members ?? []).map(member => member.karkunId);
  if (personIds.length === 0) return [];

  const users = await Users.findByPersonIds(personIds);
  return users
    .map(user => user.chatUserId as string | undefined)
    .filter((chatUserId): chatUserId is string => !!chatUserId);
};

// The chat user id of one person, if they have an ERP user with a chat
// account.
const personChatUserId = async (personId: string) => {
  const [user] = await Users.findByPersonIds([personId]);
  return (user?.chatUserId as string | undefined) || null;
};

/**
 * Discussions: the committee members talk in a chat private group.
 * - Enable reuses the committee's previous group (unarchiving it) when it
 *   still exists, otherwise creates a new one. Either way the current
 *   members are added.
 * - Disable archives the group, keeping its history for a later re-enable.
 */
export const discussionsHandler: CommitteeFeatureHandler = {
  async enable(committee) {
    let group = committee.chatGroupId
      ? await findChatGroup(committee.chatGroupId)
      : null;

    if (group?.archived) {
      await unarchiveChatGroup(group._id);
    } else if (!group) {
      group = await createChatGroup(chatGroupName(committee));
    }

    await addChatGroupMembers(group._id, await memberChatUserIds(committee));

    return { chatGroupId: group._id };
  },

  async disable(committee) {
    if (!committee.chatGroupId) return;

    const group = await findChatGroup(committee.chatGroupId);
    if (group && !group.archived) {
      await archiveChatGroup(group._id);
    }
  },

  // Keep the group's membership in step with the committee's.
  async memberAdded(committee, karkunId) {
    if (!committee.chatGroupId) return;
    const chatUserId = await personChatUserId(karkunId);
    if (chatUserId) await addChatGroupMembers(committee.chatGroupId, [chatUserId]);
  },

  async memberRemoved(committee, karkunId) {
    if (!committee.chatGroupId) return;
    const chatUserId = await personChatUserId(karkunId);
    if (chatUserId) await removeChatGroupMember(committee.chatGroupId, chatUserId);
  },
};

const isDiscussionsEnabled = (committee: CommitteeDoc) =>
  !!committee.chatGroupId &&
  !!committee.features?.includes(CommitteeFeatureKeys.DISCUSSIONS);

/**
 * Chat user ids currently in the committee's discussion group, or null when
 * the committee doesn't have Discussions enabled.
 */
export const getCommitteeDiscussionChatUserIds = async (
  committee: CommitteeDoc
): Promise<Set<string> | null> => {
  if (!isDiscussionsEnabled(committee)) return null;
  return new Set(await getChatGroupMemberIds(committee.chatGroupId!));
};

/**
 * Gives a committee member access to the committee's discussion (adds their
 * chat account to the group) or takes it away (removes it from the group).
 */
export const setCommitteeMemberDiscussionAccess = async (
  committee: CommitteeDoc,
  karkunId: string,
  hasAccess: boolean
): Promise<true> => {
  if (!isDiscussionsEnabled(committee)) {
    throw new GraphQLError('Discussions are not enabled for this committee.', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }
  if (!(committee.members ?? []).some(member => member.karkunId === karkunId)) {
    throw new GraphQLError('This person is not a member of the committee.', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }
  const chatUserId = await personChatUserId(karkunId);
  if (!chatUserId) {
    throw new GraphQLError('This member does not have a chat account.', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }

  if (hasAccess) {
    await addChatGroupMembers(committee.chatGroupId!, [chatUserId]);
  } else {
    await removeChatGroupMember(committee.chatGroupId!, chatUserId);
  }
  return true;
};

/**
 * The chat group behind a committee's discussions. Throws when the committee
 * doesn't have Discussions enabled.
 */
export const getCommitteeChatGroupId = (committee: CommitteeDoc): string => {
  const enabled = committee.features?.includes(CommitteeFeatureKeys.DISCUSSIONS);
  if (!enabled || !committee.chatGroupId) {
    throw new GraphQLError('Discussions are not enabled for this committee.', {
      extensions: { code: 'NOT_FOUND' },
    });
  }
  return committee.chatGroupId;
};
