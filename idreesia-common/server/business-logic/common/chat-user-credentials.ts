import { GraphQLError } from 'graphql';

import { Users } from 'meteor/idreesia-common/server/collections/admin';
import {
  ChatError,
  createChatUserToken,
  type ChatCredentials,
} from 'meteor/idreesia-common/server/chat';

interface ChatActor {
  _id: string;
  chatUserId?: string | null;
}

// Issues a fresh chat token for the user and keeps it on their ERP user
// (server-only; never exposed through GraphQL), so later calls reuse it
// instead of piling up login sessions in the chat server.
const issueToken = async (user: ChatActor, chatUserId: string) => {
  const credentials = await createChatUserToken(chatUserId);
  await Users.updateAsync(user._id, {
    $set: { chatAuthToken: credentials.authToken },
  });
  return credentials.authToken;
};

/**
 * Runs a chat action as the ERP user's own chat account. The user's stored
 * token is used, or a new one is issued when there is none or the chat
 * server no longer accepts it.
 */
export const withChatUserCredentials = async <T>(
  user: ChatActor,
  action: (credentials: ChatCredentials) => Promise<T>
): Promise<T> => {
  const chatUserId = user.chatUserId;
  if (!chatUserId) {
    throw new GraphQLError(
      'You need a chat account to take part. Ask an administrator to create one for you.',
      { extensions: { code: 'FORBIDDEN' } }
    );
  }

  const stored = (await Users.findOneAsync(user._id, {
    fields: { chatAuthToken: 1 },
  })) as { chatAuthToken?: string } | undefined;
  let authToken = stored?.chatAuthToken ?? (await issueToken(user, chatUserId));

  try {
    return await action({ userId: chatUserId, authToken });
  } catch (error) {
    if (!(error instanceof ChatError && error.statusCode === 401)) throw error;
    authToken = await issueToken(user, chatUserId);
    return action({ userId: chatUserId, authToken });
  }
};
