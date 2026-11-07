import {
  deleteDiscussionMessage,
  editDiscussionMessage,
  getDiscussionInfo,
  getDiscussionMembers,
  getDiscussionPinnedMessages,
  getDiscussionStarredMessages,
  getDiscussionThreadMessages,
  searchDiscussionMessages,
  getOlderDiscussionMessages,
  reactToDiscussionMessage,
  sendDiscussionMessage,
  setDiscussionMessagePinned,
  setDiscussionMessageStarred,
  syncDiscussionMessages,
} from 'meteor/idreesia-common/server/business-logic/discussions';

import {
  canPinCommitteeDiscussion,
  committeeDiscussionFileUrl,
  getCoordinatedCommitteeChatGroupId,
  getMemberCommitteeChatGroupId,
} from './access';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

// Each resolver only checks access (committee membership + Discussions
// enabled; coordinators for pinning); the work is done by the discussions
// business logic.
const resolvers: ResolverMap = {
  Query: {
    workspaceDiscussionInfo: async (obj, { committeeId }, { user }) => {
      await getMemberCommitteeChatGroupId(user, committeeId);
      return {
        ...getDiscussionInfo(user),
        canPin: await canPinCommitteeDiscussion(user, committeeId),
      };
    },

    workspaceDiscussionSync: async (obj, { committeeId, since }, { user }) => {
      const chatGroupId = await getMemberCommitteeChatGroupId(user, committeeId);
      return syncDiscussionMessages(chatGroupId, user, {
        since,
        fileUrl: committeeDiscussionFileUrl(committeeId),
      });
    },

    workspaceDiscussionThreadMessages: async (
      obj,
      { committeeId, threadId },
      { user }
    ) => {
      const chatGroupId = await getMemberCommitteeChatGroupId(user, committeeId);
      return getDiscussionThreadMessages(chatGroupId, user, threadId, {
        fileUrl: committeeDiscussionFileUrl(committeeId),
      });
    },

    workspaceDiscussionMembers: async (obj, { committeeId }, { user }) => {
      const chatGroupId = await getMemberCommitteeChatGroupId(user, committeeId);
      return getDiscussionMembers(chatGroupId);
    },

    workspaceDiscussionPinnedMessages: async (
      obj,
      { committeeId },
      { user }
    ) => {
      const chatGroupId = await getMemberCommitteeChatGroupId(user, committeeId);
      return getDiscussionPinnedMessages(chatGroupId, user, {
        fileUrl: committeeDiscussionFileUrl(committeeId),
      });
    },

    workspaceDiscussionStarredMessages: async (
      obj,
      { committeeId },
      { user }
    ) => {
      const chatGroupId = await getMemberCommitteeChatGroupId(user, committeeId);
      return getDiscussionStarredMessages(chatGroupId, user, {
        fileUrl: committeeDiscussionFileUrl(committeeId),
      });
    },

    workspaceDiscussionOlderMessages: async (
      obj,
      { committeeId, before },
      { user }
    ) => {
      const chatGroupId = await getMemberCommitteeChatGroupId(user, committeeId);
      return getOlderDiscussionMessages(chatGroupId, user, {
        before,
        fileUrl: committeeDiscussionFileUrl(committeeId),
      });
    },

    workspaceDiscussionSearchMessages: async (
      obj,
      { committeeId, searchText, offset },
      { user }
    ) => {
      const chatGroupId = await getMemberCommitteeChatGroupId(user, committeeId);
      return searchDiscussionMessages(chatGroupId, user, {
        searchText,
        offset,
        fileUrl: committeeDiscussionFileUrl(committeeId),
      });
    },
  },

  Mutation: {
    workspaceSendDiscussionMessage: async (
      obj,
      { committeeId, text, threadId },
      { user }
    ) => {
      const chatGroupId = await getMemberCommitteeChatGroupId(user, committeeId);
      return sendDiscussionMessage(chatGroupId, user, text, threadId);
    },

    workspaceReactToDiscussionMessage: async (
      obj,
      { committeeId, messageId, emoji, shouldReact },
      { user }
    ) => {
      const chatGroupId = await getMemberCommitteeChatGroupId(user, committeeId);
      return reactToDiscussionMessage(
        chatGroupId,
        user,
        messageId,
        emoji,
        shouldReact
      );
    },

    workspaceSetDiscussionMessageStarred: async (
      obj,
      { committeeId, messageId, starred },
      { user }
    ) => {
      const chatGroupId = await getMemberCommitteeChatGroupId(user, committeeId);
      return setDiscussionMessageStarred(chatGroupId, user, messageId, starred);
    },

    workspaceSetDiscussionMessagePinned: async (
      obj,
      { committeeId, messageId, pinned },
      { user }
    ) => {
      const chatGroupId = await getCoordinatedCommitteeChatGroupId(
        user,
        committeeId
      );
      return setDiscussionMessagePinned(chatGroupId, messageId, pinned);
    },

    workspaceEditDiscussionMessage: async (
      obj,
      { committeeId, messageId, text },
      { user }
    ) => {
      const chatGroupId = await getMemberCommitteeChatGroupId(user, committeeId);
      return editDiscussionMessage(chatGroupId, user, messageId, text);
    },

    workspaceDeleteDiscussionMessage: async (
      obj,
      { committeeId, messageId },
      { user }
    ) => {
      const chatGroupId = await getMemberCommitteeChatGroupId(user, committeeId);
      return deleteDiscussionMessage(chatGroupId, user, messageId);
    },
  },
};

export default resolvers;
