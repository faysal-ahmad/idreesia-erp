import {
  getDiscussionVideoCallParticipantCount,
  joinDiscussionVideoCall,
} from 'meteor/idreesia-common/server/business-logic/discussions';
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

import { getCommitteeAccess } from '../committee/access';
import { committeeDiscussionFileUrl, getDiscussionChatGroupId } from './access';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

// Who may call each field (committee role) is declared in the schema with
// @checkCommitteeAccess. The resolvers only check that Discussions is enabled
// on the committee; the work is done by the discussions business logic.
const resolvers: ResolverMap = {
  Query: {
    workspaceDiscussionInfo: async (obj, { committeeId }, context) => {
      await getDiscussionChatGroupId(context, committeeId);
      return {
        ...getConversationInfo(context.user),
        canPin: getCommitteeAccess(context, committeeId).isCoordinator,
      };
    },

    workspaceDiscussionVideoCallInfo: async (obj, { committeeId }, context) => {
      const chatGroupId = await getDiscussionChatGroupId(context, committeeId);
      return {
        participantCount: await getDiscussionVideoCallParticipantCount(chatGroupId),
      };
    },

    workspaceDiscussionSync: async (obj, { committeeId, since }, context) => {
      const chatGroupId = await getDiscussionChatGroupId(context, committeeId);
      return syncConversationMessages(chatGroupId, context.user, {
        since,
        fileUrl: committeeDiscussionFileUrl(committeeId),
      });
    },

    workspaceDiscussionThreadMessages: async (
      obj,
      { committeeId, threadId },
      context
    ) => {
      const chatGroupId = await getDiscussionChatGroupId(context, committeeId);
      return getConversationThreadMessages(chatGroupId, context.user, threadId, {
        fileUrl: committeeDiscussionFileUrl(committeeId),
      });
    },

    workspaceDiscussionMembers: async (obj, { committeeId }, context) => {
      const chatGroupId = await getDiscussionChatGroupId(context, committeeId);
      return getConversationMembers(chatGroupId);
    },

    workspaceDiscussionPinnedMessages: async (
      obj,
      { committeeId },
      context
    ) => {
      const chatGroupId = await getDiscussionChatGroupId(context, committeeId);
      return getConversationPinnedMessages(chatGroupId, context.user, {
        fileUrl: committeeDiscussionFileUrl(committeeId),
      });
    },

    workspaceDiscussionStarredMessages: async (
      obj,
      { committeeId },
      context
    ) => {
      const chatGroupId = await getDiscussionChatGroupId(context, committeeId);
      return getConversationStarredMessages(chatGroupId, context.user, {
        fileUrl: committeeDiscussionFileUrl(committeeId),
      });
    },

    workspaceDiscussionOlderMessages: async (
      obj,
      { committeeId, before },
      context
    ) => {
      const chatGroupId = await getDiscussionChatGroupId(context, committeeId);
      return getOlderConversationMessages(chatGroupId, context.user, {
        before,
        fileUrl: committeeDiscussionFileUrl(committeeId),
      });
    },

    workspaceDiscussionSearchMessages: async (
      obj,
      { committeeId, searchText, offset },
      context
    ) => {
      const chatGroupId = await getDiscussionChatGroupId(context, committeeId);
      return searchConversationMessages(chatGroupId, context.user, {
        searchText,
        offset,
        fileUrl: committeeDiscussionFileUrl(committeeId),
      });
    },
  },

  Mutation: {
    workspaceJoinDiscussionVideoCall: async (obj, { committeeId }, context) => {
      const chatGroupId = await getDiscussionChatGroupId(context, committeeId);
      return joinDiscussionVideoCall(chatGroupId, context.user);
    },

    workspaceSendDiscussionMessage: async (
      obj,
      { committeeId, text, threadId },
      context
    ) => {
      const chatGroupId = await getDiscussionChatGroupId(context, committeeId);
      return sendConversationMessage(chatGroupId, context.user, text, threadId);
    },

    workspaceReactToDiscussionMessage: async (
      obj,
      { committeeId, messageId, emoji, shouldReact },
      context
    ) => {
      const chatGroupId = await getDiscussionChatGroupId(context, committeeId);
      return reactToConversationMessage(
        chatGroupId,
        context.user,
        messageId,
        emoji,
        shouldReact
      );
    },

    workspaceSetDiscussionMessageStarred: async (
      obj,
      { committeeId, messageId, starred },
      context
    ) => {
      const chatGroupId = await getDiscussionChatGroupId(context, committeeId);
      return setConversationMessageStarred(chatGroupId, context.user, messageId, starred);
    },

    workspaceSetDiscussionMessagePinned: async (
      obj,
      { committeeId, messageId, pinned },
      context
    ) => {
      const chatGroupId = await getDiscussionChatGroupId(context, committeeId);
      return setConversationMessagePinned(chatGroupId, messageId, pinned);
    },

    workspaceEditDiscussionMessage: async (
      obj,
      { committeeId, messageId, text },
      context
    ) => {
      const chatGroupId = await getDiscussionChatGroupId(context, committeeId);
      return editConversationMessage(chatGroupId, context.user, messageId, text);
    },

    workspaceDeleteDiscussionMessage: async (
      obj,
      { committeeId, messageId },
      context
    ) => {
      const chatGroupId = await getDiscussionChatGroupId(context, committeeId);
      return deleteConversationMessage(chatGroupId, context.user, messageId);
    },
  },
};

export default resolvers;
