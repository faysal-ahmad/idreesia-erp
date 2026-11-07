import { Random } from 'meteor/random';

import { ChatError, chatGet, chatPost, type ChatCredentials } from './client';
import { getChatCreateTokensSecret } from './config';

interface ChatUser {
  _id: string;
  username?: string;
  name?: string;
}

// Chat requires an email on every account. ERP users without one get a
// placeholder on a domain that never receives mail.
const PLACEHOLDER_EMAIL_DOMAIN = 'users.idreesia.local';

/**
 * The chat user with this username, or null when there is none. The chat
 * server answers an unknown username with a 400 or 404.
 */
export const findChatUserByUsername = async (
  username: string
): Promise<ChatUser | null> => {
  try {
    const result = await chatGet<{ user: ChatUser }>('/api/v1/users.info', {
      username,
    });
    return result.user ?? null;
  } catch (error) {
    if (
      error instanceof ChatError &&
      (error.statusCode === 400 || error.statusCode === 404)
    ) {
      return null;
    }
    throw error;
  }
};

/**
 * Creates the chat account for an ERP user and returns its id. If an
 * account with the same username already exists (e.g. one made by hand
 * before the ERP managed accounts), that account is linked instead of
 * creating a duplicate.
 *
 * The password is random and never shown: users get into chat through
 * tokens minted by the ERP, not by signing in themselves.
 */
export const createChatUser = async ({
  username,
  name,
  email,
}: {
  username: string;
  name: string;
  email?: string | null;
}): Promise<string> => {
  const existing = await findChatUserByUsername(username);
  if (existing) return existing._id;

  const result = await chatPost<{ user: ChatUser }>('/api/v1/users.create', {
    username,
    name,
    email: email || `${username}@${PLACEHOLDER_EMAIL_DOMAIN}`,
    password: Random.secret(),
    verified: true,
    requirePasswordChange: false,
    joinDefaultChannels: true,
    sendWelcomeEmail: false,
    roles: ['user'],
  });

  return result.user._id;
};

/**
 * Issues a login token for a chat user, so the ERP can act as them (e.g.
 * post their messages). Each call adds a login session in the chat server,
 * so callers should keep and reuse the token rather than asking every time.
 */
export const createChatUserToken = async (
  chatUserId: string
): Promise<ChatCredentials> => {
  const result = await chatPost<{ data: ChatCredentials }>(
    '/api/v1/users.createToken',
    { userId: chatUserId, secret: getChatCreateTokensSecret() }
  );
  return result.data;
};
