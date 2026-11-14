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

export default AttachmentCategory;
