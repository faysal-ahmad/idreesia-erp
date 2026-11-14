import type {
  DmsActionValue,
  DmsEntityTypeValue,
  DmsVersionStatusValue,
} from 'meteor/idreesia-common/constants/dms';

/** Free-form key/value data callers attach to workspaces and documents. */
export type DmsMetadata = Record<string, unknown>;

interface Timestamps {
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
  deletedAt?: Date;
  deletedBy?: string;
}

export interface DmsWorkspaceSettings {
  /** Largest file, in bytes, that can be uploaded to the workspace. */
  maxFileSize?: number;
  /** Exact types (`application/pdf`) or wildcards (`image/*`). */
  allowedMimeTypes?: string[];
}

export interface DmsWorkspaceDocument extends Timestamps {
  _id: string;
  name: string;
  description?: string;
  metadata?: DmsMetadata;
  settings?: DmsWorkspaceSettings;
}

export interface DmsFolderDocument extends Timestamps {
  _id: string;
  workspaceId: string;
  parentId?: string;
  ancestorIds: string[];
  name: string;
  nameLower: string;
  trashed: boolean;
  trashRootId?: string;
}

export interface DmsDocumentLock {
  userId: string;
  lockedAt: Date;
  expiresAt: Date;
  note?: string;
}

export interface DmsDocumentDocument extends Timestamps {
  _id: string;
  workspaceId: string;
  folderId?: string;
  name: string;
  nameLower: string;
  description?: string;
  tags: string[];
  metadata?: DmsMetadata;
  versionCount: number;
  currentVersionId?: string;
  currentVersionNumber?: number;
  fileName?: string;
  mimeType?: string;
  size?: number;
  lock?: DmsDocumentLock;
  trashed: boolean;
  trashRootId?: string;
}

/** What a pending upload of a new document creates on completion. */
export interface DmsNewDocumentSpec {
  folderId?: string;
  name: string;
  nameLower: string;
  description?: string;
  tags: string[];
  metadata?: DmsMetadata;
}

export interface DmsDocumentVersionDocument extends Timestamps {
  _id: string;
  workspaceId: string;
  documentId: string;
  versionNumber?: number;
  status: DmsVersionStatusValue;
  fileKey: string;
  fileName: string;
  mimeType: string;
  size: number;
  sha256?: string;
  etag?: string;
  comment?: string;
  restoredFromVersionId?: string;
  uploadExpiresAt?: Date;
  newDocument?: DmsNewDocumentSpec;
}

export interface DmsActivityDocument {
  _id: string;
  workspaceId: string;
  entityType: DmsEntityTypeValue;
  entityId: string;
  documentId?: string;
  action: DmsActionValue;
  userId: string;
  at: Date;
  details?: Record<string, unknown>;
}
