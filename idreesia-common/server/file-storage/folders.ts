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
} as const;
