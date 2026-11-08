import type { MobileDiscussionMessageFieldsFragment } from 'meteor/idreesia-common/types/client-operations';

import { toDeviceUrl } from '/imports/startup/backend';

export interface DiscussionAttachment {
  /** 'image' | 'audio' | 'video' | 'file' */
  kind: string | null;
  title: string | null;
  mimeType: string | null;
  size: number | null;
  /** The ERP file route (relative); load it with fetchDiscussionFile. */
  url: string | null;
}

export interface DiscussionReaction {
  emoji: string;
  count: number;
  reactedByMe: boolean;
}

export interface DiscussionMessage {
  _id: string;
  text: string;
  /** ISO timestamp. */
  sentAt: string;
  senderName: string | null;
  senderId: string | null;
  senderAvatarUrl: string | null;
  isOwn: boolean;
  /** A notice such as "X was added", shown centred without a bubble. */
  isSystem: boolean;
  attachments: DiscussionAttachment[];
  editedAt: string | null;
  isPinned: boolean;
  /** Starred by the signed-in user. */
  isStarred: boolean;
  reactions: DiscussionReaction[];
  /** On a thread reply: the parent message id. */
  threadId: string | null;
  /** A thread reply that is also shown in the main list. */
  showInMainList: boolean;
  threadReplyCount: number;
}

const notNull = <T>(value: T | null | undefined): value is T => value != null;

export const toDiscussionMessages = (
  messages: Array<MobileDiscussionMessageFieldsFragment | null> | null | undefined,
): DiscussionMessage[] =>
  (messages ?? [])
    .filter(
      (message): message is MobileDiscussionMessageFieldsFragment & { _id: string; sentAt: string } =>
        Boolean(message?._id && message.sentAt),
    )
    .map(message => ({
      _id: message._id,
      text: message.text ?? '',
      sentAt: message.sentAt,
      senderName: message.senderName ?? null,
      senderId: message.senderId ?? null,
      senderAvatarUrl: toDeviceUrl(message.senderImageThumbnailUrl ?? message.senderImageUrl ?? null),
      isOwn: Boolean(message.isOwn),
      isSystem: Boolean(message.isSystem),
      attachments: (message.attachments ?? []).filter(notNull).map(attachment => ({
        kind: attachment.kind ?? null,
        title: attachment.title ?? null,
        mimeType: attachment.mimeType ?? null,
        size: attachment.size ?? null,
        url: attachment.url ?? null,
      })),
      editedAt: message.editedAt ?? null,
      isPinned: Boolean(message.isPinned),
      isStarred: Boolean(message.isStarred),
      reactions: (message.reactions ?? []).filter(notNull).map(reaction => ({
        emoji: reaction.emoji ?? '',
        count: reaction.count ?? 0,
        reactedByMe: Boolean(reaction.reactedByMe),
      })),
      threadId: message.threadId ?? null,
      showInMainList: Boolean(message.showInMainList),
      threadReplyCount: message.threadReplyCount ?? 0,
    }));
