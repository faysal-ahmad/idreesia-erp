/**
 * The document library UI is reusable: it knows nothing about committees or
 * any other host. Each place that shows a library supplies a data provider
 * implementing `DocumentsDataProvider`.
 *
 * Timestamps are milliseconds since the epoch, as strings.
 */

export interface DocumentFolder {
  _id: string;
  name: string;
  /** Null at the library root. */
  parentId: string | null;
  updatedAt: string | null;
  updatedByName: string | null;
  deletedAt: string | null;
  deletedByName: string | null;
}

export interface DocumentLock {
  userName: string | null;
  lockedAt: string | null;
  expiresAt: string | null;
  note: string | null;
  /** Checked out by the current user. */
  isMine: boolean;
}

export interface DocumentItem {
  _id: string;
  name: string;
  folderId: string | null;
  /** Search results only: the name of the folder it is in. */
  folderName: string | null;
  description: string | null;
  tags: string[];
  fileName: string | null;
  mimeType: string | null;
  size: number | null;
  currentVersionNumber: number | null;
  /** Set while the document is checked out. */
  lock: DocumentLock | null;
  createdAt: string | null;
  createdByName: string | null;
  updatedAt: string | null;
  updatedByName: string | null;
  deletedAt: string | null;
  deletedByName: string | null;
}

export interface DocumentVersion {
  _id: string;
  versionNumber: number | null;
  fileName: string;
  mimeType: string;
  size: number;
  comment: string | null;
  isCurrent: boolean;
  createdAt: string | null;
  createdByName: string | null;
}

export interface DocumentActivity {
  _id: string;
  /** e.g. 'document-created'; see ACTIVITY_LABELS. */
  action: string;
  userName: string | null;
  at: string | null;
  details: Record<string, unknown>;
}

export interface DocumentsInfo {
  /** The current user can purge, empty the trash, delete versions and force-unlock. */
  canManage: boolean;
  /** Largest file, in bytes, that can be uploaded. */
  maxFileSize: number;
}

export interface FolderContents {
  /** The folders from the root down to this one (empty at the root). */
  path: DocumentFolder[];
  folders: DocumentFolder[];
  documents: DocumentItem[];
  totalDocuments: number;
}

export interface DocumentPage {
  documents: DocumentItem[];
  totalResults: number;
}

export interface TrashContents {
  folders: DocumentFolder[];
  documents: DocumentItem[];
}

export interface UploadTarget {
  /** A new document in this folder (null = root)... */
  folderId?: string | null;
  /** ...or a new version of this document. */
  documentId?: string;
  comment?: string;
}

export interface RestoreOptions {
  /** Restore under this name instead of its own. */
  newName?: string;
  /** Restore at the top level instead of its original folder. */
  toRoot?: boolean;
}

export interface DocumentChanges {
  name: string;
  description: string | null;
  tags: string[];
}

/** An error from a provider action; `code` is the server's error code. */
export class DocumentsError extends Error {
  constructor(
    message: string,
    readonly code: string | null = null
  ) {
    super(message);
    this.name = 'DocumentsError';
  }
}

/**
 * Every action rejects with a `DocumentsError` whose message is shown to the
 * user. Its `code` (e.g. 'CONFLICT', 'LOCKED') lets the UI react, such as
 * asking for a new name when a restored item's name is taken.
 */
export interface DocumentsDataProvider {
  getInfo(): Promise<DocumentsInfo>;

  /** A folder (null = root) with a page of its documents. */
  loadFolderContents(
    folderId: string | null,
    pageIndex: number,
    pageSize: number
  ): Promise<FolderContents>;

  /** Every folder, for picking a move target. */
  loadFolders(): Promise<DocumentFolder[]>;

  searchDocuments(
    text: string,
    pageIndex: number,
    pageSize: number
  ): Promise<DocumentPage>;

  loadDocument(documentId: string): Promise<DocumentItem | null>;
  loadVersions(documentId: string): Promise<DocumentVersion[]>;
  /** Newest first; pass the last entry's `at` as `before` for more. */
  loadActivity(
    documentId: string,
    before?: string
  ): Promise<DocumentActivity[]>;
  loadTrash(): Promise<TrashContents>;

  createFolder(parentId: string | null, name: string): Promise<void>;
  renameFolder(folderId: string, name: string): Promise<void>;
  moveFolder(folderId: string, parentId: string | null): Promise<void>;
  trashFolder(folderId: string): Promise<void>;

  /**
   * Uploads a file as a new document or a new version, reporting progress
   * as a fraction (0-1).
   */
  uploadFile(
    file: File,
    target: UploadTarget,
    onProgress?: (fraction: number) => void
  ): Promise<void>;

  updateDocument(documentId: string, changes: DocumentChanges): Promise<void>;
  moveDocument(documentId: string, folderId: string | null): Promise<void>;
  trashDocument(documentId: string): Promise<void>;
  /** A short-lived link to a version (default: the current one). */
  getDownloadUrl(documentId: string, versionId?: string): Promise<string>;

  restoreVersion(documentId: string, versionId: string): Promise<void>;
  deleteVersion(documentId: string, versionId: string): Promise<void>;

  checkOut(documentId: string, note?: string): Promise<void>;
  checkIn(documentId: string): Promise<void>;
  forceUnlock(documentId: string): Promise<void>;

  /**
   * Restores a trashed folder or document. Rejects with code 'CONFLICT' when
   * its name is taken (retry with `newName`) or its folder no longer exists
   * (retry with `toRoot`).
   */
  restoreTrashItem(itemId: string, options?: RestoreOptions): Promise<void>;
  purgeTrashItem(itemId: string): Promise<void>;
  /** Returns how many items were purged. */
  emptyTrash(): Promise<number>;
}
