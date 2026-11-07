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

export default AttachmentCategory;
