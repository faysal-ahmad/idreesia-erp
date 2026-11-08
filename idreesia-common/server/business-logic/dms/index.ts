/**
 * Headless document management system: workspaces of folders and versioned
 * documents, stored in object storage.
 *
 * Callers enforce access - nothing here checks whether a user may see or
 * change a workspace. Every function takes the acting user's id, which is
 * recorded on changes and in the activity log, and the module enforces its
 * own rules: a document checked out by one user can't be changed by others,
 * names are unique within a folder, folders can't be moved into themselves.
 * Errors are GraphQLErrors with an `extensions.code` (see DmsErrorCode).
 */
export type { DmsErrorCode } from './errors';
export type {
  DmsPage,
  DmsPageOptions,
  DmsSortOptions,
  DmsDocumentSortField,
  DmsSortOrder,
} from './internal';

export { listActivity } from './activity';
export type { ListActivityOptions } from './activity';

export {
  createWorkspace,
  updateWorkspace,
  getWorkspace,
  listWorkspaces,
  deleteWorkspace,
  restoreWorkspace,
  purgeWorkspace,
} from './workspaces';
export type {
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
  ListWorkspacesOptions,
} from './workspaces';

export {
  createFolder,
  getFolder,
  renameFolder,
  moveFolder,
  getFolderPath,
  listFolderContents,
  listFolders,
} from './folders';
export type { CreateFolderInput, FolderContents } from './folders';

export {
  uploadDocument,
  getDocument,
  updateDocument,
  moveDocument,
  copyDocument,
  getDocumentDownloadUrl,
  readDocumentContent,
} from './documents';
export type {
  UploadDocumentInput,
  UpdateDocumentInput,
  DocumentWithVersion,
  DownloadOptions,
  DocumentDownload,
} from './documents';

export {
  uploadNewVersion,
  listVersions,
  restoreVersion,
  deleteVersion,
} from './versions';
export type { NewVersionInput } from './versions';

export {
  createUploadUrl,
  completeUpload,
  abortUpload,
  purgeExpiredUploads,
} from './uploads';
export type { CreateUploadInput, UploadTicket } from './uploads';

export {
  checkOutDocument,
  checkInDocument,
  forceUnlockDocument,
  getLockStatus,
} from './locking';
export type { CheckOutOptions, LockStatus } from './locking';

export {
  trashDocument,
  trashFolder,
  listTrash,
  restoreFromTrash,
  purgeFromTrash,
  emptyTrash,
} from './trash';
export type { TrashContents, RestoreOptions, EmptyTrashResult } from './trash';

export { searchDocuments } from './search';
export type { SearchDocumentsOptions, DmsSearchResult } from './search';
