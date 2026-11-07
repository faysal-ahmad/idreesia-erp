import {
  getInboxConversation,
  getInboxConversations,
  replyToInboxConversation,
} from './queries';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

const resolvers: ResolverMap = {
  Query: {
    pagedInboxConversations: async (obj, { filter }) =>
      getInboxConversations(filter ?? {}),

    inboxConversation: async (obj, { roomId }) =>
      getInboxConversation(roomId),
  },

  Mutation: {
    sendInboxMessage: async (obj, { roomId, text }, { user }) =>
      replyToInboxConversation(
        roomId,
        text,
        user?.displayName || user?.username
      ),
  },
};

export default resolvers;
