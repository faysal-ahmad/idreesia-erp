import {
  deleteConversationMessage,
  editConversationMessage,
  getConversationInfo,
  getConversationMembers,
  getConversationPinnedMessages,
  getConversationStarredMessages,
  getConversationThreadMessages,
  searchConversationMessages,
  getOlderConversationMessages,
  reactToConversationMessage,
  sendConversationMessage,
  setConversationMessagePinned,
  setConversationMessageStarred,
  syncConversationMessages,
} from 'meteor/idreesia-common/server/business-logic/rocket-chat';

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
        ...getConversationInfo(user),
        canPin: await canPinCommitteeDiscussion(user, committeeId),
      };
    },

    workspaceDiscussionSync: async (obj, { committeeId, since }, { user }) => {
      const chatGroupId = await getMemberCommitteeChatGroupId(user, committeeId);
      return syncConversationMessages(chatGroupId, user, {
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
      return getConversationThreadMessages(chatGroupId, user, threadId, {
        fileUrl: committeeDiscussionFileUrl(committeeId),
      });
    },

    workspaceDiscussionMembers: async (obj, { committeeId }, { user }) => {
      const chatGroupId = await getMemberCommitteeChatGroupId(user, committeeId);
      return getConversationMembers(chatGroupId);
    },

    workspaceDiscussionPinnedMessages: async (
      obj,
      { committeeId },
      { user }
    ) => {
      const chatGroupId = await getMemberCommitteeChatGroupId(user, committeeId);
      return getConversationPinnedMessages(chatGroupId, user, {
        fileUrl: committeeDiscussionFileUrl(committeeId),
      });
    },

    workspaceDiscussionStarredMessages: async (
      obj,
      { committeeId },
      { user }
    ) => {
      const chatGroupId = await getMemberCommitteeChatGroupId(user, committeeId);
      return getConversationStarredMessages(chatGroupId, user, {
        fileUrl: committeeDiscussionFileUrl(committeeId),
      });
    },

    workspaceDiscussionOlderMessages: async (
      obj,
      { committeeId, before },
      { user }
    ) => {
      const chatGroupId = await getMemberCommitteeChatGroupId(user, committeeId);
      return getOlderConversationMessages(chatGroupId, user, {
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
      return searchConversationMessages(chatGroupId, user, {
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
      return sendConversationMessage(chatGroupId, user, text, threadId);
    },

    workspaceReactToDiscussionMessage: async (
      obj,
      { committeeId, messageId, emoji, shouldReact },
      { user }
    ) => {
      const chatGroupId = await getMemberCommitteeChatGroupId(user, committeeId);
      return reactToConversationMessage(
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
      return setConversationMessageStarred(chatGroupId, user, messageId, starred);
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
      return setConversationMessagePinned(chatGroupId, messageId, pinned);
    },

    workspaceEditDiscussionMessage: async (
      obj,
      { committeeId, messageId, text },
      { user }
    ) => {
      const chatGroupId = await getMemberCommitteeChatGroupId(user, committeeId);
      return editConversationMessage(chatGroupId, user, messageId, text);
    },

    workspaceDeleteDiscussionMessage: async (
      obj,
      { committeeId, messageId },
      { user }
    ) => {
      const chatGroupId = await getMemberCommitteeChatGroupId(user, committeeId);
      return deleteConversationMessage(chatGroupId, user, messageId);
    },
  },
};

export default resolvers;
