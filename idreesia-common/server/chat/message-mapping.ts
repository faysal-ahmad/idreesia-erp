import type { ChatAttachment, ChatDate } from './omnichannel';

/**
 * Helpers shared by everything that turns Rocket.Chat messages into ERP
 * shapes (the Correspondence inbox, discussions, ...).
 */

export interface MappedChatAttachment {
  kind: 'image' | 'audio' | 'video' | 'file';
  title: string | null;
  mimeType: string | null;
  size: number | null;
  url: string | null;
}

/** Builds the ERP URL a browser should use for an uploaded chat file. */
export type ChatFileUrlBuilder = (fileId: string, fileName: string) => string;

export const toIsoString = (date?: ChatDate | null): string | null => {
  if (!date) return null;
  if (date instanceof Date) return date.toISOString();
  if (typeof date === 'object' && '$date' in date) {
    return new Date(date.$date).toISOString();
  }
  return new Date(date).toISOString();
};

// Rocket.Chat serves uploads at /file-upload/<fileId>/<fileName>, as a
// relative path or a full URL.
const FILE_UPLOAD_PATH = /^\/file-upload\/([^/?#]+)\/([^?#]+)/;

/**
 * Rewrites a Rocket.Chat upload URL to an ERP URL. The browser never talks to
 * Rocket.Chat, so files go through an ERP proxy route chosen by the caller.
 */
export const toErpFileUrl = (
  chatUrl: string | null | undefined,
  fileUrl: ChatFileUrlBuilder
): string | null => {
  if (!chatUrl) return null;
  let path = chatUrl;
  if (/^https?:\/\//i.test(chatUrl)) {
    try {
      path = new URL(chatUrl).pathname;
    } catch {
      return null;
    }
  }
  const match = FILE_UPLOAD_PATH.exec(path);
  if (!match) return null;
  return fileUrl(match[1], match[2]);
};

/**
 * Maps a Rocket.Chat message attachment. Quotes and other attachments
 * without a file give null.
 */
export const mapChatAttachment = (
  attachment: ChatAttachment,
  fileUrl: ChatFileUrlBuilder
): MappedChatAttachment | null => {
  const title = attachment.title ?? null;
  if (attachment.image_url) {
    return {
      kind: 'image',
      title,
      mimeType: attachment.image_type ?? null,
      size: attachment.image_size ?? null,
      url: toErpFileUrl(attachment.image_url, fileUrl),
    };
  }
  if (attachment.audio_url) {
    return {
      kind: 'audio',
      title,
      mimeType: attachment.audio_type ?? null,
      size: attachment.audio_size ?? null,
      url: toErpFileUrl(attachment.audio_url, fileUrl),
    };
  }
  if (attachment.video_url) {
    return {
      kind: 'video',
      title,
      mimeType: attachment.video_type ?? null,
      size: attachment.video_size ?? null,
      url: toErpFileUrl(attachment.video_url, fileUrl),
    };
  }
  if (attachment.title_link) {
    return {
      kind: 'file',
      title,
      mimeType: null,
      size: null,
      url: toErpFileUrl(attachment.title_link, fileUrl),
    };
  }
  return null;
};
