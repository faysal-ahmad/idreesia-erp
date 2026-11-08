/**
 * Constants for the headless document management system
 * (server/business-logic/dms).
 */

export const DmsEntityType = {
  WORKSPACE: 'workspace',
  FOLDER: 'folder',
  DOCUMENT: 'document',
  VERSION: 'version',
} as const;
export type DmsEntityTypeValue =
  (typeof DmsEntityType)[keyof typeof DmsEntityType];

export const DmsVersionStatus = {
  /** A direct-to-storage upload that has not been completed yet. */
  PENDING: 'pending',
  READY: 'ready',
} as const;
export type DmsVersionStatusValue =
  (typeof DmsVersionStatus)[keyof typeof DmsVersionStatus];

export const DmsAction = {
  WORKSPACE_CREATED: 'workspace-created',
  WORKSPACE_UPDATED: 'workspace-updated',
  WORKSPACE_DELETED: 'workspace-deleted',
  WORKSPACE_RESTORED: 'workspace-restored',

  FOLDER_CREATED: 'folder-created',
  FOLDER_RENAMED: 'folder-renamed',
  FOLDER_MOVED: 'folder-moved',
  FOLDER_TRASHED: 'folder-trashed',
  FOLDER_RESTORED: 'folder-restored',
  FOLDER_PURGED: 'folder-purged',

  DOCUMENT_CREATED: 'document-created',
  DOCUMENT_UPDATED: 'document-updated',
  DOCUMENT_MOVED: 'document-moved',
  DOCUMENT_COPIED: 'document-copied',
  DOCUMENT_TRASHED: 'document-trashed',
  DOCUMENT_RESTORED: 'document-restored',
  DOCUMENT_PURGED: 'document-purged',
  DOCUMENT_DOWNLOADED: 'document-downloaded',
  DOCUMENT_CHECKED_OUT: 'document-checked-out',
  DOCUMENT_CHECKED_IN: 'document-checked-in',
  DOCUMENT_FORCE_UNLOCKED: 'document-force-unlocked',

  VERSION_ADDED: 'version-added',
  VERSION_RESTORED: 'version-restored',
  VERSION_DELETED: 'version-deleted',
} as const;
export type DmsActionValue = (typeof DmsAction)[keyof typeof DmsAction];

/** Used when a workspace doesn't set its own settings.maxFileSize. */
export const DMS_DEFAULT_MAX_FILE_SIZE = 100 * 1024 * 1024;
/** How long a presigned direct-upload URL (and its pending upload) lives. */
export const DMS_UPLOAD_URL_EXPIRY_SECONDS = 15 * 60;
/** How long a presigned download URL lives. */
export const DMS_DOWNLOAD_URL_EXPIRY_SECONDS = 15 * 60;
export const DMS_DEFAULT_PAGE_SIZE = 50;
export const DMS_MAX_PAGE_SIZE = 200;
export const DMS_MAX_NAME_LENGTH = 255;
