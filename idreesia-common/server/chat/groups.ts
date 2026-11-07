import {
  ChatError,
  chatFetchRaw,
  chatGet,
  chatPost,
  chatPostMultipart,
  type ChatCredentials,
} from './client';
import type { ChatMessage } from './omnichannel';

/**
 * Private groups (Rocket.Chat `groups.*`). The ERP service account creates
 * them, so it is their owner and can manage them afterwards.
 */
export interface ChatGroup {
  _id: string;
  name?: string;
  archived?: boolean;
}

/**
 * The private group with this id, or null when it no longer exists (or the
 * service account can no longer see it). The chat server answers an unknown
 * room with a 400 or 404.
 */
export const findChatGroup = async (
  roomId: string
): Promise<ChatGroup | null> => {
  try {
    const result = await chatGet<{ group: ChatGroup }>('/api/v1/groups.info', {
      roomId,
    });
    return result.group ?? null;
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

/** Creates an empty private group and returns it. */
export const createChatGroup = async (name: string): Promise<ChatGroup> => {
  const result = await chatPost<{ group: ChatGroup }>('/api/v1/groups.create', {
    name,
    members: [],
  });
  return result.group;
};

/**
 * Adds chat users to a private group. Users already in the group are left
 * as they are.
 */
export const addChatGroupMembers = async (
  roomId: string,
  chatUserIds: string[]
): Promise<void> => {
  for (const userId of chatUserIds) {
    // One call per user: the single-user form works on every Rocket.Chat
    // version, and committees are small.
    await chatPost('/api/v1/groups.invite', { roomId, userId });
  }
};

/**
 * Removes a chat user from a private group. A user who is not in the group
 * is treated as already removed.
 */
export const removeChatGroupMember = async (
  roomId: string,
  userId: string
): Promise<void> => {
  try {
    await chatPost('/api/v1/groups.kick', { roomId, userId });
  } catch (error) {
    if (
      error instanceof ChatError &&
      /not-in-room|not in (this|the) room/i.test(error.message)
    ) {
      return;
    }
    throw error;
  }
};

export interface ChatGroupMember {
  _id: string;
  username?: string;
  name?: string;
}

/** Everyone in a private group (read as the owner). */
export const getChatGroupMembers = async (
  roomId: string
): Promise<ChatGroupMember[]> => {
  const pageSize = 100;
  const members: ChatGroupMember[] = [];
  let offset = 0;
  let total = Infinity;
  while (offset < total) {
    const result = await chatGet<{
      members: ChatGroupMember[];
      total: number;
    }>('/api/v1/groups.members', { roomId, offset, count: pageSize });
    members.push(...(result.members ?? []));
    total = result.total ?? 0;
    if (!result.members?.length) break;
    offset += result.members.length;
  }
  return members;
};

/** Chat user ids of everyone in a private group (read as the owner). */
export const getChatGroupMemberIds = async (
  roomId: string
): Promise<string[]> =>
  (await getChatGroupMembers(roomId)).map(member => member._id);

export const archiveChatGroup = async (roomId: string): Promise<void> => {
  await chatPost('/api/v1/groups.archive', { roomId });
};

export const unarchiveChatGroup = async (roomId: string): Promise<void> => {
  await chatPost('/api/v1/groups.unarchive', { roomId });
};

/**
 * Messages of a private group, newest first. `oldest` (exclusive) limits the
 * result to messages after that time. Read as the service account, which
 * owns the groups it creates.
 */
export const getChatGroupMessages = async (
  groupId: string,
  {
    oldest,
    latest,
    count = 100,
  }: { oldest?: string; latest?: string; count?: number } = {}
): Promise<ChatMessage[]> => {
  // `oldest` and `latest` are both exclusive.
  const result = await chatGet<{ messages: ChatMessage[] }>(
    '/api/v1/groups.history',
    { roomId: groupId, oldest, latest, count }
  );
  return result.messages ?? [];
};

/**
 * Messages of a room created or changed since `lastUpdate`, and the ids of
 * those deleted since then. Read as the service account.
 */
export const syncChatMessages = async (
  roomId: string,
  lastUpdate: string
): Promise<{ updated: ChatMessage[]; deleted: Array<{ _id: string }> }> => {
  const { result } = await chatGet<{
    result: { updated?: ChatMessage[]; deleted?: Array<{ _id: string }> };
  }>('/api/v1/chat.syncMessages', { roomId, lastUpdate });
  return { updated: result?.updated ?? [], deleted: result?.deleted ?? [] };
};

/** One message (read as the service account), or null when not found. */
export const getChatMessage = async (
  messageId: string
): Promise<ChatMessage | null> => {
  try {
    const { message } = await chatGet<{ message: ChatMessage }>(
      '/api/v1/chat.getMessage',
      { msgId: messageId }
    );
    return message ?? null;
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

/** Replies of a thread, newest first (read as the service account). */
export const getChatThreadMessages = async (
  threadId: string,
  { count = 200 }: { count?: number } = {}
): Promise<ChatMessage[]> => {
  const result = await chatGet<{ messages: ChatMessage[] }>(
    '/api/v1/chat.getThreadMessages',
    { tmid: threadId, count, sort: JSON.stringify({ ts: -1 }) }
  );
  return result.messages ?? [];
};

/**
 * Posts a text message to a private group as the given chat user; with
 * `threadId`, as a reply in that thread.
 */
export const sendChatGroupMessage = async (
  groupId: string,
  text: string,
  credentials: ChatCredentials,
  threadId?: string
): Promise<void> => {
  await chatPost(
    '/api/v1/chat.sendMessage',
    {
      message: { rid: groupId, msg: text, ...(threadId ? { tmid: threadId } : {}) },
    },
    credentials
  );
};

/** Adds or removes the user's reaction (a shortcode such as ':smile:'). */
export const reactToChatMessage = async (
  messageId: string,
  shortcode: string,
  shouldReact: boolean,
  credentials: ChatCredentials
): Promise<void> => {
  await chatPost(
    '/api/v1/chat.react',
    { messageId, emoji: shortcode, shouldReact },
    credentials
  );
};

/** Stars or unstars a message for the user. */
export const setChatMessageStarred = async (
  messageId: string,
  starred: boolean,
  credentials: ChatCredentials
): Promise<void> => {
  await chatPost(
    starred ? '/api/v1/chat.starMessage' : '/api/v1/chat.unStarMessage',
    { messageId },
    credentials
  );
};

/** Pins or unpins a message, as the service account (the room owner). */
export const setChatMessagePinned = async (
  messageId: string,
  pinned: boolean
): Promise<void> => {
  await chatPost(
    pinned ? '/api/v1/chat.pinMessage' : '/api/v1/chat.unPinMessage',
    { messageId }
  );
};

/** Changes a message's text, as the user (Rocket.Chat checks ownership). */
export const updateChatMessage = async (
  roomId: string,
  messageId: string,
  text: string,
  credentials: ChatCredentials
): Promise<void> => {
  await chatPost(
    '/api/v1/chat.update',
    { roomId, msgId: messageId, text },
    credentials
  );
};

/** Deletes a message, as the user (Rocket.Chat checks ownership). */
export const deleteChatMessage = async (
  roomId: string,
  messageId: string,
  credentials: ChatCredentials
): Promise<void> => {
  await chatPost('/api/v1/chat.delete', { roomId, msgId: messageId }, credentials);
};

/**
 * Uploads a file to a private group as the given chat user: the file is
 * stored first (rooms.media), then posted as a message (rooms.mediaConfirm);
 * with `threadId`, as a reply in that thread.
 */
export const uploadChatGroupFile = async (
  groupId: string,
  file: { buffer: Buffer; fileName: string; mimeType: string },
  credentials: ChatCredentials,
  threadId?: string
): Promise<void> => {
  const formData = new FormData();
  formData.append(
    'file',
    new Blob([new Uint8Array(file.buffer)], { type: file.mimeType }),
    file.fileName
  );
  const { file: stored } = await chatPostMultipart<{
    file: { _id: string };
  }>(`/api/v1/rooms.media/${groupId}`, formData, credentials);

  await chatPost(
    `/api/v1/rooms.mediaConfirm/${groupId}/${stored._id}`,
    { fileName: file.fileName, ...(threadId ? { tmid: threadId } : {}) },
    credentials
  );
};

/** Pinned messages of a room, newest first (read as the service account). */
export const getChatPinnedMessages = async (
  roomId: string,
  { count = 100 }: { count?: number } = {}
): Promise<ChatMessage[]> => {
  const result = await chatGet<{ messages: ChatMessage[] }>(
    '/api/v1/chat.getPinnedMessages',
    { roomId, count }
  );
  return result.messages ?? [];
};

/**
 * Messages of a room matching a search, newest first (read as the service
 * account). `searchText` uses Rocket.Chat's search syntax: words, or a
 * regular expression such as /^text$/i.
 */
export const searchChatMessages = async (
  roomId: string,
  searchText: string,
  { count = 50, offset = 0 }: { count?: number; offset?: number } = {}
): Promise<ChatMessage[]> => {
  const result = await chatGet<{ messages: ChatMessage[] }>(
    '/api/v1/chat.search',
    { roomId, searchText, count, offset }
  );
  return result.messages ?? [];
};

/** Messages of a room starred by the given chat user, newest first. */
export const getChatStarredMessages = async (
  roomId: string,
  credentials: ChatCredentials,
  { count = 100 }: { count?: number } = {}
): Promise<ChatMessage[]> => {
  const result = await chatGet<{ messages: ChatMessage[] }>(
    '/api/v1/chat.getStarredMessages',
    { roomId, count },
    credentials
  );
  return result.messages ?? [];
};

/**
 * Fetches a file uploaded to a private group, for streaming on. Fetched as
 * the service account, which is a member of the groups it creates.
 */
export const fetchChatGroupFile = async (
  fileId: string,
  fileName: string
): Promise<Response> =>
  chatFetchRaw(
    `/file-upload/${encodeURIComponent(fileId)}/${encodeURIComponent(fileName)}`
  );
