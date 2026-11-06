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
  { oldest, count = 100 }: { oldest?: string; count?: number } = {}
): Promise<ChatMessage[]> => {
  const result = await chatGet<{ messages: ChatMessage[] }>(
    '/api/v1/groups.history',
    { roomId: groupId, oldest, count }
  );
  return result.messages ?? [];
};

/** Posts a text message to a private group as the given chat user. */
export const sendChatGroupMessage = async (
  groupId: string,
  text: string,
  credentials: ChatCredentials
): Promise<void> => {
  await chatPost(
    '/api/v1/chat.sendMessage',
    { message: { rid: groupId, msg: text } },
    credentials
  );
};

/**
 * Uploads a file to a private group as the given chat user: the file is
 * stored first (rooms.media), then posted as a message (rooms.mediaConfirm).
 */
export const uploadChatGroupFile = async (
  groupId: string,
  file: { buffer: Buffer; fileName: string; mimeType: string },
  credentials: ChatCredentials
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
    { fileName: file.fileName },
    credentials
  );
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
