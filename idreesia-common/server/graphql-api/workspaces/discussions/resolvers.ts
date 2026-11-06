import {
  getDiscussionInfo,
  getDiscussionMessages,
  sendDiscussionMessage,
} from 'meteor/idreesia-common/server/business-logic/discussions';

import {
  committeeDiscussionFileUrl,
  getMemberCommitteeChatGroupId,
} from './access';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

// Each resolver only checks access (committee membership + Discussions
// enabled); the work is done by the discussions business logic.
const resolvers: ResolverMap = {
  Query: {
    workspaceDiscussionInfo: async (obj, { committeeId }, { user }) => {
      await getMemberCommitteeChatGroupId(user, committeeId);
      return getDiscussionInfo(user);
    },

    workspaceDiscussionMessages: async (
      obj,
      { committeeId, after },
      { user }
    ) => {
      const chatGroupId = await getMemberCommitteeChatGroupId(user, committeeId);
      return getDiscussionMessages(chatGroupId, user, {
        after,
        fileUrl: committeeDiscussionFileUrl(committeeId),
      });
    },
  },

  Mutation: {
    workspaceSendDiscussionMessage: async (
      obj,
      { committeeId, text },
      { user }
    ) => {
      const chatGroupId = await getMemberCommitteeChatGroupId(user, committeeId);
      return sendDiscussionMessage(chatGroupId, user, text);
    },
  },
};

export default resolvers;
