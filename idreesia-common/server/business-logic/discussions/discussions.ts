import { createHmac, timingSafeEqual } from 'crypto';
import { GraphQLError } from 'graphql';

import {
  ChatError,
  deleteChatMessage,
  emojiToShortcode,
  fetchChatGroupFile,
  getChatConfig,
  getChatGroupMembers,
  getChatGroupMessages,
  getChatMessage,
  getChatPinnedMessages,
  getChatStarredMessages,
  searchChatMessages,
  getChatThreadMessages,
  mapChatAttachment,
  reactToChatMessage,
  replaceShortcodes,
  sendChatGroupMessage,
  setChatMessagePinned,
  setChatMessageStarred,
  shortcodeToEmoji,
  syncChatMessages,
  toIsoString,
  updateChatMessage,
  uploadChatGroupFile,
  type ChatFileUrlBuilder,
  type ChatMessage,
  type MappedChatAttachment,
} from 'meteor/idreesia-common/server/chat';
import { withChatUserCredentials } from 'meteor/idreesia-common/server/business-logic/common/chat-user-credentials';
import {
  getPersonImageUrls,
  type PersonImageFields,
  type PersonImageUrls,
} from 'meteor/idreesia-common/server/business-logic/common/person-images';
import { Users } from 'meteor/idreesia-common/server/collections/admin';
import {
  Attachments,
  People,
} from 'meteor/idreesia-common/server/collections/common';

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
  /** Also the chat username: chat accounts are created with it. */
  username?: string | null;
  chatUserId?: string | null;
}

export interface DiscussionReaction {
  emoji: string;
  count: number;
  usernames: string[];
  reactedByMe: boolean;
}

export interface DiscussionMessage {
  _id: string;
  text: string;
  sentAt: string | null;
  senderName: string | null;
  /** The sender's chat user id. */
  senderId: string | null;
  /** The sender's profile image (chat user → ERP user → person). */
  senderImageUrl: string | null;
  senderImageThumbnailUrl: string | null;
  isOwn: boolean;
  isSystem: boolean;
  attachments: MappedChatAttachment[];
  editedAt: string | null;
  isPinned: boolean;
  /** Starred by the acting user. */
  isStarred: boolean;
  reactions: DiscussionReaction[];
  /** On a thread reply: the parent message id. */
  threadId: string | null;
  /** A thread reply that is also shown in the main list. */
  showInMainList: boolean;
  /** On a thread parent. */
  threadReplyCount: number;
  threadLastReplyAt: string | null;
}

export interface DiscussionSync {
  messages: DiscussionMessage[];
  deletedIds: string[];
  /** Pass back as `since` on the next sync. */
  syncedAt: string;
  /** Initial load only: older messages exist (see getOlderDiscussionMessages). */
  hasOlder?: boolean;
}

/** A page of messages, oldest first; `hasMore` when another page exists. */
export interface DiscussionMessagePage {
  messages: DiscussionMessage[];
  hasMore: boolean;
}

export const MAX_DISCUSSION_MESSAGE_LENGTH = 5000;
export const MAX_DISCUSSION_FILE_SIZE = 25 * 1024 * 1024;
const PAGE_SIZE = 100;
// The chat server stamps updates with its own clock; syncing from a little
// before "now" covers clock differences (re-delivered messages are merged).
const SYNC_OVERLAP_MS = 30_000;

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
    // Pins are made through the service account, so its name is not shown.
    case 'message_pinned':
      return 'A message was pinned';
    default:
      return null;
  }
};

const EMPTY_MESSAGE_EXTRAS = {
  editedAt: null,
  isPinned: false,
  isStarred: false,
  reactions: [],
  threadId: null,
  showInMainList: false,
  threadReplyCount: 0,
  threadLastReplyAt: null,
};

const mapReactions = (
  message: ChatMessage,
  actor: DiscussionActor
): DiscussionReaction[] =>
  Object.entries(message.reactions ?? {})
    .map(([shortcode, reaction]) => {
      const usernames = reaction.usernames ?? [];
      return {
        emoji: shortcodeToEmoji(shortcode) ?? shortcode,
        count: usernames.length,
        usernames,
        reactedByMe: !!actor.username && usernames.includes(actor.username),
      };
    })
    .filter(reaction => reaction.count > 0);

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
      senderId: null,
      senderImageUrl: null,
      senderImageThumbnailUrl: null,
      isOwn: false,
      isSystem: true,
      attachments: [],
      ...EMPTY_MESSAGE_EXTRAS,
      threadId: message.tmid ?? null,
    };
  }

  return {
    _id: message._id,
    text: replaceShortcodes(message.msg ?? ''),
    sentAt: toIsoString(message.ts),
    senderName: message.u?.name || message.u?.username || null,
    senderId: message.u?._id ?? null,
    senderImageUrl: null,
    senderImageThumbnailUrl: null,
    isOwn: !!actor.chatUserId && message.u?._id === actor.chatUserId,
    isSystem: false,
    attachments: (message.attachments ?? [])
      .map(attachment => mapChatAttachment(attachment, fileUrl))
      .filter((attachment): attachment is MappedChatAttachment => !!attachment),
    editedAt: message.editedAt ? toIsoString(message.editedAt) : null,
    isPinned: !!message.pinned,
    isStarred:
      !!actor.chatUserId &&
      (message.starred ?? []).some(star => star._id === actor.chatUserId),
    reactions: mapReactions(message, actor),
    threadId: message.tmid ?? null,
    showInMainList: !!message.tshow,
    threadReplyCount: message.tcount ?? 0,
    threadLastReplyAt: message.tlm ? toIsoString(message.tlm) : null,
  };
};

// Profile images of chat users: chat user → ERP user (chatUserId) →
// person (personId) → shared profile image. One lookup per collection.
const getChatUserImages = async (chatUserIds: string[]) => {
  const images = new Map<string, PersonImageUrls>();
  const uniqueIds = [...new Set(chatUserIds.filter(Boolean))];
  if (uniqueIds.length === 0) return images;

  const users = (await Users.find(
    { chatUserId: { $in: uniqueIds } },
    { fields: { chatUserId: 1, personId: 1 } }
  ).fetchAsync()) as Array<{ chatUserId?: string; personId?: string }>;
  const personIds = users
    .map(user => user.personId)
    .filter((id): id is string => !!id);
  if (personIds.length === 0) return images;

  const people = (await People.find(
    { _id: { $in: personIds } },
    {
      fields: {
        'sharedData.imageKey': 1,
        'sharedData.imageThumbnailKey': 1,
        'sharedData.imageId': 1,
        'sharedData.imageThumbnailId': 1,
      },
    }
  ).fetchAsync()) as Array<{
    _id: string;
    sharedData?: PersonImageFields;
  }>;
  const personById = new Map(people.map(person => [person._id, person]));

  // A legacy thumbnail id can point to an attachment that no longer exists;
  // only hand out thumbnails that do, so callers fall back to the full image.
  const thumbnailIds = people
    .filter(person => !person.sharedData?.imageKey)
    .map(person => person.sharedData?.imageThumbnailId)
    .filter((id): id is string => !!id);
  const existingThumbnailIds = new Set(
    thumbnailIds.length
      ? (
          (await Attachments.find(
            { _id: { $in: thumbnailIds } },
            { fields: { _id: 1 } }
          ).fetchAsync()) as Array<{ _id: string }>
        ).map(attachment => attachment._id)
      : []
  );

  users.forEach(user => {
    const shared = user.personId
      ? personById.get(user.personId)?.sharedData
      : undefined;
    if (!user.chatUserId || !shared) return;

    const thumbnailId = shared.imageThumbnailId;
    const urls = getPersonImageUrls({
      ...shared,
      imageThumbnailId:
        thumbnailId && existingThumbnailIds.has(thumbnailId)
          ? thumbnailId
          : null,
    });
    if (urls.imageUrl) images.set(user.chatUserId, urls);
  });
  return images;
};

const addSenderImages = async (messages: DiscussionMessage[]) => {
  const images = await getChatUserImages(
    messages
      .map(message => message.senderId)
      .filter((id): id is string => !!id)
  );
  return messages.map(message => {
    const image = message.senderId ? images.get(message.senderId) : undefined;
    if (!image) return message;
    return {
      ...message,
      senderImageUrl: image.imageUrl,
      senderImageThumbnailUrl: image.imageThumbnailUrl,
    };
  });
};

export interface DiscussionMember {
  /** Chat username, used in @mentions. */
  username: string;
  name: string | null;
  imageUrl: string | null;
  imageThumbnailUrl: string | null;
}

/**
 * People in a discussion, for @mention suggestions. The ERP service
 * account (the group's owner) is left out.
 */
export const getDiscussionMembers = async (
  chatGroupId: string
): Promise<DiscussionMember[]> => {
  const serviceUserId = getChatConfig().userId;
  const members = (
    await runChatAction('load the discussion members', () =>
      getChatGroupMembers(chatGroupId)
    )
  ).filter(member => member._id !== serviceUserId && !!member.username);
  const images = await getChatUserImages(members.map(member => member._id));

  return members
    .map(member => {
      const image = images.get(member._id);
      return {
        username: member.username!,
        name: member.name ?? null,
        imageUrl: image?.imageUrl ?? null,
        imageThumbnailUrl: image?.imageThumbnailUrl ?? null,
      };
    })
    .sort((a, b) =>
      (a.name ?? a.username).localeCompare(b.name ?? b.username)
    );
};

/** Whether the user can post (they need their own chat account). */
export const getDiscussionInfo = (actor: DiscussionActor) => ({
  canPost: !!actor.chatUserId,
});

const signedFileUrlFor =
  (chatGroupId: string, fileUrl: ChatFileUrlBuilder): ChatFileUrlBuilder =>
  (fileId, fileName) =>
    `${fileUrl(fileId, fileName)}?sig=${signFile(chatGroupId, fileId)}`;

const mapMessages = (
  messages: ChatMessage[],
  actor: DiscussionActor,
  fileUrl: ChatFileUrlBuilder
) =>
  addSenderImages(
    messages
      .map(message => mapMessage(message, actor, fileUrl))
      .filter((message): message is DiscussionMessage => !!message)
  );

/**
 * Keeps a discussion current. Without `since`: the latest page of messages
 * (oldest first). With `since` (the `syncedAt` of the previous call): the
 * messages created or changed since then (new messages, edits, reactions,
 * pins, thread replies) and the ids of deleted ones.
 *
 * `fileUrl` builds the caller's own file route; a signature query parameter
 * is added to each URL for `fetchDiscussionFile` to check.
 */
export const syncDiscussionMessages = async (
  chatGroupId: string,
  actor: DiscussionActor,
  { since, fileUrl }: { since?: string | null; fileUrl: ChatFileUrlBuilder }
): Promise<DiscussionSync> => {
  const syncedAt = new Date(Date.now() - SYNC_OVERLAP_MS).toISOString();
  const signedFileUrl = signedFileUrlFor(chatGroupId, fileUrl);

  if (!since) {
    const messages = await runChatAction('load the discussion', () =>
      getChatGroupMessages(chatGroupId, { count: PAGE_SIZE })
    );
    return {
      messages: await mapMessages(messages.slice().reverse(), actor, signedFileUrl),
      deletedIds: [],
      syncedAt,
      hasOlder: messages.length >= PAGE_SIZE,
    };
  }

  const { updated, deleted } = await runChatAction('load the discussion', () =>
    syncChatMessages(chatGroupId, since)
  );
  return {
    messages: await mapMessages(
      updated.filter(message => message.rid === chatGroupId),
      actor,
      signedFileUrl
    ),
    deletedIds: deleted.map(message => message._id),
    syncedAt,
  };
};

// The message, after checking it belongs to this discussion's group (the
// service account can read every group, so ids from the client are checked).
const getGroupMessage = async (chatGroupId: string, messageId: string) => {
  const message = await runChatAction('load the message', () =>
    getChatMessage(messageId)
  );
  if (!message || message.rid !== chatGroupId) {
    throw new GraphQLError('Message not found.', {
      extensions: { code: 'NOT_FOUND' },
    });
  }
  return message;
};

// The message, after checking it is the acting user's own.
const getOwnGroupMessage = async (
  chatGroupId: string,
  actor: DiscussionActor,
  messageId: string
) => {
  const message = await getGroupMessage(chatGroupId, messageId);
  if (!actor.chatUserId || message.u?._id !== actor.chatUserId) {
    throw new GraphQLError('You can only change your own messages.', {
      extensions: { code: 'FORBIDDEN' },
    });
  }
  return message;
};

const checkMessageText = (text: string) => {
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
  return trimmed;
};

/** A thread: its parent message first, then the replies, oldest first. */
export const getDiscussionThreadMessages = async (
  chatGroupId: string,
  actor: DiscussionActor,
  threadId: string,
  { fileUrl }: { fileUrl: ChatFileUrlBuilder }
): Promise<DiscussionMessage[]> => {
  const parent = await getGroupMessage(chatGroupId, threadId);
  const replies = await runChatAction('load the thread', () =>
    getChatThreadMessages(threadId)
  );
  return mapMessages(
    [parent, ...replies.slice().reverse()],
    actor,
    signedFileUrlFor(chatGroupId, fileUrl)
  );
};

/** Adds or removes the user's reaction (an emoji character) on a message. */
export const reactToDiscussionMessage = async (
  chatGroupId: string,
  actor: DiscussionActor,
  messageId: string,
  emoji: string,
  shouldReact: boolean
): Promise<true> => {
  await getGroupMessage(chatGroupId, messageId);
  const shortcode = emojiToShortcode(emoji);
  if (!shortcode) {
    throw new GraphQLError('This emoji cannot be used as a reaction.', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }
  await runChatAction('react to the message', () =>
    withChatUserCredentials(actor, credentials =>
      reactToChatMessage(messageId, shortcode, shouldReact, credentials)
    )
  );
  return true;
};

/** Stars or unstars a message for the user. */
export const setDiscussionMessageStarred = async (
  chatGroupId: string,
  actor: DiscussionActor,
  messageId: string,
  starred: boolean
): Promise<true> => {
  await getGroupMessage(chatGroupId, messageId);
  await runChatAction(starred ? 'star the message' : 'unstar the message', () =>
    withChatUserCredentials(actor, credentials =>
      setChatMessageStarred(messageId, starred, credentials)
    )
  );
  return true;
};

/**
 * Pins or unpins a message for everyone. Done as the service account (the
 * group owner); callers decide who may pin.
 */
export const setDiscussionMessagePinned = async (
  chatGroupId: string,
  messageId: string,
  pinned: boolean
): Promise<true> => {
  await getGroupMessage(chatGroupId, messageId);
  await runChatAction(pinned ? 'pin the message' : 'unpin the message', () =>
    setChatMessagePinned(messageId, pinned)
  );
  return true;
};

/** Changes the text of one of the user's own messages. */
export const editDiscussionMessage = async (
  chatGroupId: string,
  actor: DiscussionActor,
  messageId: string,
  text: string
): Promise<true> => {
  const trimmed = checkMessageText(text);
  await getOwnGroupMessage(chatGroupId, actor, messageId);
  await runChatAction('edit the message', () =>
    withChatUserCredentials(actor, credentials =>
      updateChatMessage(chatGroupId, messageId, trimmed, credentials)
    )
  );
  return true;
};

/** Deletes one of the user's own messages. */
export const deleteDiscussionMessage = async (
  chatGroupId: string,
  actor: DiscussionActor,
  messageId: string
): Promise<true> => {
  await getOwnGroupMessage(chatGroupId, actor, messageId);
  await runChatAction('delete the message', () =>
    withChatUserCredentials(actor, credentials =>
      deleteChatMessage(chatGroupId, messageId, credentials)
    )
  );
  return true;
};

/**
 * Posts a text message as the user; with `threadId`, as a reply in that
 * thread.
 */
export const sendDiscussionMessage = async (
  chatGroupId: string,
  actor: DiscussionActor,
  text: string,
  threadId?: string | null
): Promise<true> => {
  const trimmed = checkMessageText(text);
  if (threadId) await getGroupMessage(chatGroupId, threadId);

  await runChatAction('send the message', () =>
    withChatUserCredentials(actor, credentials =>
      sendChatGroupMessage(chatGroupId, trimmed, credentials, threadId ?? undefined)
    )
  );
  return true;
};

/**
 * Uploads a file as the user; it appears in the discussion as a message
 * (with `threadId`, as a reply in that thread).
 */
export const uploadDiscussionFile = async (
  chatGroupId: string,
  actor: DiscussionActor,
  file: { buffer: Buffer; fileName: string; mimeType: string },
  threadId?: string | null
): Promise<true> => {
  if (file.buffer.length > MAX_DISCUSSION_FILE_SIZE) {
    throw new GraphQLError('Files can be at most 25 MB.', {
      extensions: { code: 'PAYLOAD_TOO_LARGE' },
    });
  }
  if (threadId) await getGroupMessage(chatGroupId, threadId);

  await runChatAction('upload the file', () =>
    withChatUserCredentials(actor, credentials =>
      uploadChatGroupFile(chatGroupId, file, credentials, threadId ?? undefined)
    )
  );
  return true;
};

/** Pinned messages of a discussion, oldest first. */
export const getDiscussionPinnedMessages = async (
  chatGroupId: string,
  actor: DiscussionActor,
  { fileUrl }: { fileUrl: ChatFileUrlBuilder }
): Promise<DiscussionMessage[]> => {
  const messages = await runChatAction('load the pinned messages', () =>
    getChatPinnedMessages(chatGroupId)
  );
  return mapMessages(
    messages.slice().reverse(),
    actor,
    signedFileUrlFor(chatGroupId, fileUrl)
  );
};

/**
 * The page of messages sent before `before` (an ISO time, exclusive), oldest
 * first, for loading history further back than the initial load.
 */
export const getOlderDiscussionMessages = async (
  chatGroupId: string,
  actor: DiscussionActor,
  { before, fileUrl }: { before: string; fileUrl: ChatFileUrlBuilder }
): Promise<DiscussionMessagePage> => {
  const messages = await runChatAction('load older messages', () =>
    getChatGroupMessages(chatGroupId, { latest: before, count: PAGE_SIZE })
  );
  return {
    messages: await mapMessages(
      messages.slice().reverse(),
      actor,
      signedFileUrlFor(chatGroupId, fileUrl)
    ),
    hasMore: messages.length >= PAGE_SIZE,
  };
};

const MAX_SEARCH_TEXT_LENGTH = 200;
const SEARCH_PAGE_SIZE = 50;

/**
 * A page of messages matching a search, oldest first. Pages go back in time:
 * `offset` 0 is the newest matches, then pass the number of matches already
 * shown. Words match anywhere in a message; a regular expression such as
 * /^text$/i is also accepted. Read as the service account, so users without
 * a chat account can search too.
 */
export const searchDiscussionMessages = async (
  chatGroupId: string,
  actor: DiscussionActor,
  {
    searchText,
    offset = 0,
    fileUrl,
  }: { searchText: string; offset?: number | null; fileUrl: ChatFileUrlBuilder }
): Promise<DiscussionMessagePage> => {
  const trimmed = (searchText ?? '').trim();
  if (!trimmed) return { messages: [], hasMore: false };
  if (trimmed.length > MAX_SEARCH_TEXT_LENGTH) {
    throw new GraphQLError(
      `Searches can be at most ${MAX_SEARCH_TEXT_LENGTH} characters.`,
      { extensions: { code: 'BAD_USER_INPUT' } }
    );
  }

  const messages = await runChatAction('search the discussion', () =>
    searchChatMessages(chatGroupId, trimmed, {
      count: SEARCH_PAGE_SIZE,
      offset: Math.max(0, offset ?? 0),
    })
  );
  return {
    messages: await mapMessages(
      messages.slice().reverse(),
      actor,
      signedFileUrlFor(chatGroupId, fileUrl)
    ),
    hasMore: messages.length >= SEARCH_PAGE_SIZE,
  };
};

/**
 * Messages of a discussion starred by the user, oldest first. Users without
 * a chat account have none.
 */
export const getDiscussionStarredMessages = async (
  chatGroupId: string,
  actor: DiscussionActor,
  { fileUrl }: { fileUrl: ChatFileUrlBuilder }
): Promise<DiscussionMessage[]> => {
  if (!actor.chatUserId) return [];
  const messages = await runChatAction('load the starred messages', () =>
    withChatUserCredentials(actor, credentials =>
      getChatStarredMessages(chatGroupId, credentials)
    )
  );
  return mapMessages(
    messages.slice().reverse(),
    actor,
    signedFileUrlFor(chatGroupId, fileUrl)
  );
};

/**
 * A file from a discussion, for streaming on. The signature must be the one
 * `syncDiscussionMessages` put on the file's URL for this same group.
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
