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

export interface DiscussionMessage {
  _id: string;
  text: string;
  /** ISO timestamp. */
  sentAt: string | null;
  senderName: string | null;
  /** Posted by the current user. */
  isOwn: boolean;
  /** A notice such as "X was added", shown centred without a bubble. */
  isSystem: boolean;
  attachments: DiscussionAttachment[];
}

export interface DiscussionInfo {
  /** False when the current user can read but not post. */
  canPost: boolean;
}

export interface DiscussionDataProvider {
  /** How often to check for new messages while the page is visible. */
  readonly pollIntervalMs: number;

  getInfo(): Promise<DiscussionInfo>;

  /**
   * Messages oldest first: the latest page, or with `after` (an ISO
   * timestamp) only the messages after it.
   */
  loadMessages(options?: { after?: string }): Promise<DiscussionMessage[]>;

  /** Rejects with an Error whose message is shown to the user. */
  sendMessage(text: string): Promise<void>;

  /** Rejects with an Error whose message is shown to the user. */
  uploadFile(file: File): Promise<void>;

  /** Loads an attachment URL from a message (e.g. with auth headers). */
  fetchFile(url: string): Promise<Blob>;
}

export const MAX_DISCUSSION_MESSAGE_LENGTH = 5000;
export const MAX_DISCUSSION_FILE_SIZE = 25 * 1024 * 1024;
