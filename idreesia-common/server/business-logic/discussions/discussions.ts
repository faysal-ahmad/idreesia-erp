import { createHmac, timingSafeEqual } from 'crypto';
import { GraphQLError } from 'graphql';

import {
  ChatError,
  fetchChatGroupFile,
  getChatConfig,
  getChatGroupMessages,
  mapChatAttachment,
  sendChatGroupMessage,
  toIsoString,
  uploadChatGroupFile,
  type ChatFileUrlBuilder,
  type ChatMessage,
  type MappedChatAttachment,
} from 'meteor/idreesia-common/server/chat';
import { withChatUserCredentials } from 'meteor/idreesia-common/server/business-logic/common/chat-user-credentials';

/**
 * Discussions: members of something (a committee today) talking in a chat
 * private group.
 *
 * Nothing here checks who may take part. Callers establish that with their
 * own rules first, then pass the chat group id they resolved and the acting
 * ERP user.
 */

export interface DiscussionActor {
  _id: string;
  chatUserId?: string | null;
}

export interface DiscussionMessage {
  _id: string;
  text: string;
  sentAt: string | null;
  senderName: string | null;
  isOwn: boolean;
  isSystem: boolean;
  attachments: MappedChatAttachment[];
}

export const MAX_DISCUSSION_MESSAGE_LENGTH = 5000;
export const MAX_DISCUSSION_FILE_SIZE = 25 * 1024 * 1024;
const PAGE_SIZE = 100;

// Turns chat failures (unreachable server, rejected request, ...) into a
// GraphQL error carrying the reason. Errors that are already GraphQL errors
// pass through.
const runChatAction = async <T>(
  description: string,
  action: () => Promise<T>
): Promise<T> => {
  try {
    return await action();
  } catch (error) {
    if (error instanceof GraphQLError) throw error;
    const reason = error instanceof Error ? error.message : String(error);
    throw new GraphQLError(`Could not ${description}: ${reason}`, {
      extensions: {
        code: 'DISCUSSION_FAILED',
        statusCode: error instanceof ChatError ? error.statusCode : undefined,
      },
    });
  }
};

// ----------------------------------------------------------------------------
// File URL signatures
// ----------------------------------------------------------------------------
// The service account can read the files of every group, so a file URL must
// not work for a group other than the one it was listed for. Each URL handed
// out carries a signature over (group, file), checked when the file is
// fetched.

const signFile = (chatGroupId: string, fileId: string) =>
  createHmac('sha256', getChatConfig().authToken)
    .update(`${chatGroupId}:${fileId}`)
    .digest('hex')
    .slice(0, 32);

const isValidFileSignature = (
  chatGroupId: string,
  fileId: string,
  signature: string
) => {
  const expected = Buffer.from(signFile(chatGroupId, fileId));
  const given = Buffer.from(signature);
  return expected.length === given.length && timingSafeEqual(expected, given);
};

// ----------------------------------------------------------------------------
// Messages
// ----------------------------------------------------------------------------

// System messages worth showing, as readable text. Others are left out.
const systemMessageText = (message: ChatMessage): string | null => {
  const actor = message.u?.name || message.u?.username || 'Someone';
  switch (message.t) {
    case 'uj':
      return `${actor} joined`;
    case 'ul':
      return `${actor} left`;
    case 'au':
      return `${message.msg} was added`;
    case 'ru':
      return `${message.msg} was removed`;
    case 'room-archived':
      return 'Discussions were turned off';
    case 'room-unarchived':
      return 'Discussions were turned back on';
    default:
      return null;
  }
};

const mapMessage = (
  message: ChatMessage,
  actor: DiscussionActor,
  fileUrl: ChatFileUrlBuilder
): DiscussionMessage | null => {
  if (message.t) {
    const text = systemMessageText(message);
    if (!text) return null;
    return {
      _id: message._id,
      text,
      sentAt: toIsoString(message.ts),
      senderName: null,
      isOwn: false,
      isSystem: true,
      attachments: [],
    };
  }

  return {
    _id: message._id,
    text: message.msg ?? '',
    sentAt: toIsoString(message.ts),
    senderName: message.u?.name || message.u?.username || null,
    isOwn: !!actor.chatUserId && message.u?._id === actor.chatUserId,
    isSystem: false,
    attachments: (message.attachments ?? [])
      .map(attachment => mapChatAttachment(attachment, fileUrl))
      .filter((attachment): attachment is MappedChatAttachment => !!attachment),
  };
};

/** Whether the user can post (they need their own chat account). */
export const getDiscussionInfo = (actor: DiscussionActor) => ({
  canPost: !!actor.chatUserId,
});

/**
 * Messages of a discussion, oldest first: the latest page, or with `after`
 * (an ISO time) only the messages after it, for polling.
 *
 * `fileUrl` builds the caller's own file route; a signature query parameter
 * is added to each URL for `fetchDiscussionFile` to check.
 */
export const getDiscussionMessages = async (
  chatGroupId: string,
  actor: DiscussionActor,
  { after, fileUrl }: { after?: string | null; fileUrl: ChatFileUrlBuilder }
): Promise<DiscussionMessage[]> => {
  const signedFileUrl: ChatFileUrlBuilder = (fileId, fileName) =>
    `${fileUrl(fileId, fileName)}?sig=${signFile(chatGroupId, fileId)}`;

  const messages = await runChatAction('load the discussion', () =>
    getChatGroupMessages(chatGroupId, {
      oldest: after ?? undefined,
      count: PAGE_SIZE,
    })
  );

  return messages
    .slice()
    .reverse()
    .map(message => mapMessage(message, actor, signedFileUrl))
    .filter((message): message is DiscussionMessage => !!message);
};

/** Posts a text message as the user. */
export const sendDiscussionMessage = async (
  chatGroupId: string,
  actor: DiscussionActor,
  text: string
): Promise<true> => {
  const trimmed = (text ?? '').trim();
  if (!trimmed) {
    throw new GraphQLError('The message is empty.', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }
  if (trimmed.length > MAX_DISCUSSION_MESSAGE_LENGTH) {
    throw new GraphQLError(
      `Messages can be at most ${MAX_DISCUSSION_MESSAGE_LENGTH} characters.`,
      { extensions: { code: 'BAD_USER_INPUT' } }
    );
  }

  await runChatAction('send the message', () =>
    withChatUserCredentials(actor, credentials =>
      sendChatGroupMessage(chatGroupId, trimmed, credentials)
    )
  );
  return true;
};

/** Uploads a file as the user; it appears in the discussion as a message. */
export const uploadDiscussionFile = async (
  chatGroupId: string,
  actor: DiscussionActor,
  file: { buffer: Buffer; fileName: string; mimeType: string }
): Promise<true> => {
  if (file.buffer.length > MAX_DISCUSSION_FILE_SIZE) {
    throw new GraphQLError('Files can be at most 25 MB.', {
      extensions: { code: 'PAYLOAD_TOO_LARGE' },
    });
  }

  await runChatAction('upload the file', () =>
    withChatUserCredentials(actor, credentials =>
      uploadChatGroupFile(chatGroupId, file, credentials)
    )
  );
  return true;
};

/**
 * A file from a discussion, for streaming on. The signature must be the one
 * `getDiscussionMessages` put on the file's URL for this same group.
 */
export const fetchDiscussionFile = async (
  chatGroupId: string,
  { fileId, fileName, signature }: { fileId: string; fileName: string; signature: string }
): Promise<Response> => {
  if (!signature || !isValidFileSignature(chatGroupId, fileId, signature)) {
    throw new GraphQLError('File not found.', {
      extensions: { code: 'NOT_FOUND' },
    });
  }
  return runChatAction('load the file', () =>
    fetchChatGroupFile(fileId, fileName)
  );
};
