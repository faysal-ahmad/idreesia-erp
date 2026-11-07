/**
 * The discussions UI is reusable: it knows nothing about committees or any
 * other host. Each place that shows a discussion supplies a data provider
 * implementing `DiscussionDataProvider`.
 */

export interface DiscussionAttachment {
  /** 'image' | 'audio' | 'video' | 'file' */
  kind: string | null;
  title: string | null;
  mimeType: string | null;
  size: number | null;
  /** Fetched through `DiscussionDataProvider.fetchFile`. */
  url: string | null;
}

export interface DiscussionReaction {
  emoji: string;
  count: number;
  usernames: string[];
  /** The current user is one of the reactors. */
  reactedByMe: boolean;
}

export interface DiscussionMessage {
  _id: string;
  text: string;
  /** ISO timestamp. */
  sentAt: string | null;
  senderName: string | null;
  /** Identifies the sender, e.g. to group their consecutive messages. */
  senderId: string | null;
  /** The sender's profile picture; a letter avatar is shown without one. */
  senderAvatarUrl: string | null;
  /** Posted by the current user. */
  isOwn: boolean;
  /** A notice such as "X was added", shown centred without a bubble. */
  isSystem: boolean;
  attachments: DiscussionAttachment[];
  /** ISO timestamp of the last edit. */
  editedAt: string | null;
  isPinned: boolean;
  /** Starred by the current user. */
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
  /** New and changed messages (including thread replies). */
  messages: DiscussionMessage[];
  deletedIds: string[];
  /** Pass back as `since` on the next sync. */
  syncedAt: string;
  /** Initial load only: older messages exist (see `loadOlderMessages`). */
  hasOlder?: boolean;
}

/** A page of messages, oldest first; `hasMore` when another page exists. */
export interface DiscussionMessagePage {
  messages: DiscussionMessage[];
  hasMore: boolean;
}

export interface DiscussionMember {
  /** Chat username, inserted as @username when mentioned. */
  username: string;
  name: string | null;
  avatarUrl: string | null;
}

export interface DiscussionInfo {
  /** False when the current user can read but not post. */
  canPost: boolean;
  /** The current user can pin and unpin messages. */
  canPin: boolean;
}

export interface DiscussionDataProvider {
  /** How often to check for new messages while the page is visible. */
  readonly pollIntervalMs: number;

  getInfo(): Promise<DiscussionInfo>;

  /** People in the discussion, for @mention suggestions. */
  loadMembers(): Promise<DiscussionMember[]>;

  /**
   * Without `since`: the latest messages, oldest first. With `since` (the
   * previous result's `syncedAt`): what was created, changed or deleted
   * since then.
   */
  syncMessages(since?: string): Promise<DiscussionSync>;

  /** A thread: the parent message first, then its replies, oldest first. */
  loadThreadMessages(threadId: string): Promise<DiscussionMessage[]>;

  /** Pinned messages, oldest first. */
  loadPinnedMessages(): Promise<DiscussionMessage[]>;

  /** Messages the current user starred, oldest first. */
  loadStarredMessages(): Promise<DiscussionMessage[]>;

  /**
   * The page of messages sent before `before` (an ISO timestamp), oldest
   * first, for history older than the initial load.
   */
  loadOlderMessages(before: string): Promise<DiscussionMessagePage>;

  /**
   * A page of messages matching a search, oldest first. Pages go back in
   * time: `offset` 0 is the newest matches, then the number already shown.
   * Rejects with an Error whose message is shown to the user.
   */
  searchMessages(searchText: string, offset?: number): Promise<DiscussionMessagePage>;

  /**
   * Rejects with an Error whose message is shown to the user (as do all
   * the actions below). With `threadId`, posts a reply in that thread.
   */
  sendMessage(text: string, threadId?: string): Promise<void>;

  /** Adds or removes the current user's reaction (an emoji character). */
  reactToMessage(messageId: string, emoji: string, shouldReact: boolean): Promise<void>;

  setMessageStarred(messageId: string, starred: boolean): Promise<void>;

  setMessagePinned(messageId: string, pinned: boolean): Promise<void>;

  /** Only for the current user's own messages. */
  editMessage(messageId: string, text: string): Promise<void>;

  /** Only for the current user's own messages. */
  deleteMessage(messageId: string): Promise<void>;

  /**
   * Rejects with an Error whose message is shown to the user. With
   * `threadId`, posts the file as a reply in that thread.
   */
  uploadFile(file: File, threadId?: string): Promise<void>;

  /** Loads an attachment URL from a message (e.g. with auth headers). */
  fetchFile(url: string): Promise<Blob>;
}

export const MAX_DISCUSSION_MESSAGE_LENGTH = 5000;
export const MAX_DISCUSSION_FILE_SIZE = 25 * 1024 * 1024;
