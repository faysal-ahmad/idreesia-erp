/**
 * What an uploaded attachment belongs to. Sent with every upload so the
 * server can file it in that feature's object storage folder.
 */
const AttachmentCategory = {
  PURCHASE_FORM: 'purchase-form',
  ISSUANCE_FORM: 'issuance-form',
  PROFILE: 'profile',
} as const;

export type AttachmentCategoryValue =
  (typeof AttachmentCategory)[keyof typeof AttachmentCategory];

/**
 * Largest file accepted by /upload-file. The server buffers each upload in
 * memory before storing it, so this keeps one request from exhausting it.
 */
export const ATTACHMENT_MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * File types /upload-file and /upload-base64-file accept: pictures, PDFs,
 * office documents, plain text and zip archives. Object storage serves a file
 * as the type it was stored with, so types a browser would run as a page
 * (HTML, SVG, XML, JavaScript) are left out.
 */
export const ATTACHMENT_ALLOWED_MIME_TYPES: readonly string[] = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/heic',
  'image/heif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.spreadsheet',
  'text/plain',
  'text/csv',
  'application/zip',
  'application/x-zip-compressed',
];

export const isAllowedAttachmentMimeType = (mimeType: unknown) =>
  typeof mimeType === 'string' &&
  ATTACHMENT_ALLOWED_MIME_TYPES.includes(mimeType.trim().toLowerCase());

export default AttachmentCategory;
