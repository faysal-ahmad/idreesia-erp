/**
 * Top-level folders (key prefixes) in the file storage bucket. Every feature
 * that stores files declares its own folder here.
 */
export const StorageFolders = {
  SecurityServerProfileImages: 'security-server-profile-images',
  SecurityServerAlertImages: 'security-server-alert-images',
} as const;
