/**
 * Top-level folders (key prefixes) in the file storage bucket. Every feature
 * that stores files declares its own folder here.
 */
export const StorageFolders = {
  SecurityServerProfileImages: 'security-server-profile-images',
  SecurityServerAlertImages: 'security-server-alert-images',
  // Publicly readable (see getPublicFileUrl) - keys must stay unguessable.
  PeopleImages: 'people-images',
  StockItemImages: 'stock-item-images',
  // Private - served through short-lived presigned URLs.
  PurchaseFormAttachments: 'purchase-form-attachments',
  IssuanceFormAttachments: 'issuance-form-attachments',
  ProfileAttachments: 'profile-attachments',
  // Document management system (business-logic/dms) - one object per
  // document version: <folder>/<workspaceId>/<documentId>/<versionId>.<ext>
  Documents: 'dms-documents',
  // Meetings module (business-logic/meetings) - one object per attachment:
  // <folder>/<workspaceId>/<meetingId>/<attachmentId>.<ext>
  MeetingAttachments: 'meeting-attachments',
} as const;
