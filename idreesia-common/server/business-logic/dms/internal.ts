import {
  DMS_DEFAULT_MAX_FILE_SIZE,
  DMS_DEFAULT_PAGE_SIZE,
  DMS_MAX_NAME_LENGTH,
  DMS_MAX_PAGE_SIZE,
} from 'meteor/idreesia-common/constants/dms';
import {
  DmsDocuments,
  DmsFolders,
  DmsWorkspaces,
  type DmsDocumentDocument,
  type DmsDocumentLock,
  type DmsFolderDocument,
  type DmsMetadata,
  type DmsWorkspaceDocument,
} from 'meteor/idreesia-common/server/collections/dms';
import {
  deleteFiles,
  getFileExtension,
  StorageFolders,
} from 'meteor/idreesia-common/server/file-storage';

import { dmsError } from './errors';

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------

/** Every DMS call names the acting user, for audit fields, logs and locks. */
export function requireUserId(userId: unknown): asserts userId is string {
  if (typeof userId !== 'string' || !userId) {
    throw dmsError('BAD_USER_INPUT', 'A user id is required');
  }
}

const hasControlCharacters = (value: string) =>
  [...value].some(char => {
    const code = char.charCodeAt(0);
    return code < 0x20 || code === 0x7f;
  });

/** Trims and checks a folder or document name. */
export function normalizeName(name: unknown, what = 'Name') {
  if (typeof name !== 'string') {
    throw dmsError('BAD_USER_INPUT', `${what} is required`);
  }
  const trimmed = name.trim().replace(/\s+/g, ' ');
  if (!trimmed) throw dmsError('BAD_USER_INPUT', `${what} is required`);
  if (trimmed.length > DMS_MAX_NAME_LENGTH) {
    throw dmsError(
      'BAD_USER_INPUT',
      `${what} must be at most ${DMS_MAX_NAME_LENGTH} characters`
    );
  }
  if (
    trimmed === '.' ||
    trimmed === '..' ||
    /[/\\]/.test(trimmed) ||
    hasControlCharacters(trimmed)
  ) {
    throw dmsError('BAD_USER_INPUT', `${what} contains invalid characters`);
  }
  return { name: trimmed, nameLower: trimmed.toLowerCase() };
}

const MAX_TAGS = 50;
const MAX_TAG_LENGTH = 64;

/** Trimmed, lower-cased, de-duplicated tags. */
export function normalizeTags(tags: unknown): string[] {
  if (tags === undefined || tags === null) return [];
  if (!Array.isArray(tags) || tags.some(tag => typeof tag !== 'string')) {
    throw dmsError('BAD_USER_INPUT', 'Tags must be a list of strings');
  }
  const normalized = [
    ...new Set(
      (tags as string[])
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0)
    ),
  ];
  if (normalized.length > MAX_TAGS) {
    throw dmsError('BAD_USER_INPUT', `At most ${MAX_TAGS} tags are allowed`);
  }
  if (normalized.some(tag => tag.length > MAX_TAG_LENGTH)) {
    throw dmsError(
      'BAD_USER_INPUT',
      `Tags must be at most ${MAX_TAG_LENGTH} characters`
    );
  }
  return normalized;
}

/** Metadata keys are searchable as `metadata.<key>`, so they are restricted. */
export const METADATA_KEY_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

export function validateMetadata(metadata: unknown): DmsMetadata | undefined {
  if (metadata === undefined || metadata === null) return undefined;
  if (
    typeof metadata !== 'object' ||
    Array.isArray(metadata) ||
    Object.getPrototypeOf(metadata) !== Object.prototype
  ) {
    throw dmsError('BAD_USER_INPUT', 'Metadata must be a plain object');
  }
  const badKey = Object.keys(metadata).find(
    key => !METADATA_KEY_PATTERN.test(key)
  );
  if (badKey !== undefined) {
    throw dmsError(
      'BAD_USER_INPUT',
      `Invalid metadata key "${badKey}" (letters, digits, _ and - only)`
    );
  }
  return metadata as DmsMetadata;
}

const MIME_TYPE_PATTERN = /^[\w.+-]+\/[\w.+-]+$/;

/** Lower-cased MIME type without parameters (`; charset=...`). */
export function normalizeMimeType(mimeType: unknown): string {
  const value =
    typeof mimeType === 'string'
      ? mimeType.split(';')[0].trim().toLowerCase()
      : '';
  if (!MIME_TYPE_PATTERN.test(value)) {
    throw dmsError('BAD_USER_INPUT', 'A valid MIME type is required');
  }
  return value;
}

const isMimeTypeAllowed = (mimeType: string, allowed: string[]) =>
  allowed.some(pattern => {
    const normalized = pattern.trim().toLowerCase();
    return normalized.endsWith('/*')
      ? mimeType.startsWith(normalized.slice(0, -1))
      : mimeType === normalized;
  });

/** Checks a file against the workspace's size and type limits. */
export function validateFile(
  workspace: DmsWorkspaceDocument,
  size: number,
  mimeType: string
) {
  if (!Number.isSafeInteger(size) || size < 0) {
    throw dmsError('BAD_USER_INPUT', 'A valid file size is required');
  }
  const maxFileSize =
    workspace.settings?.maxFileSize ?? DMS_DEFAULT_MAX_FILE_SIZE;
  if (size > maxFileSize) {
    throw dmsError(
      'TOO_LARGE',
      `File is larger than the ${maxFileSize} byte limit`,
      { maxFileSize }
    );
  }
  const allowed = workspace.settings?.allowedMimeTypes;
  if (allowed?.length && !isMimeTypeAllowed(mimeType, allowed)) {
    throw dmsError(
      'BAD_USER_INPUT',
      `Files of type ${mimeType} are not allowed in this workspace`
    );
  }
}

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

export async function requireWorkspace(
  workspaceId: string,
  { includeDeleted = false }: { includeDeleted?: boolean } = {}
): Promise<DmsWorkspaceDocument> {
  const workspace = workspaceId
    ? await DmsWorkspaces.findOneAsync(workspaceId)
    : undefined;
  if (!workspace || (!includeDeleted && workspace.deletedAt)) {
    throw dmsError('NOT_FOUND', 'Workspace not found');
  }
  return workspace;
}

export async function requireFolder(
  folderId: string,
  {
    workspaceId,
    includeTrashed = false,
  }: { workspaceId?: string; includeTrashed?: boolean } = {}
): Promise<DmsFolderDocument> {
  const folder = folderId ? await DmsFolders.findOneAsync(folderId) : undefined;
  if (
    !folder ||
    (!includeTrashed && folder.trashed) ||
    (workspaceId && folder.workspaceId !== workspaceId)
  ) {
    throw dmsError('NOT_FOUND', 'Folder not found');
  }
  if (!workspaceId) await requireWorkspace(folder.workspaceId);
  return folder;
}

export async function requireDocument(
  documentId: string,
  {
    workspaceId,
    includeTrashed = false,
  }: { workspaceId?: string; includeTrashed?: boolean } = {}
): Promise<DmsDocumentDocument> {
  const document = documentId
    ? await DmsDocuments.findOneAsync(documentId)
    : undefined;
  if (
    !document ||
    (!includeTrashed && document.trashed) ||
    (workspaceId && document.workspaceId !== workspaceId)
  ) {
    throw dmsError('NOT_FOUND', 'Document not found');
  }
  if (!workspaceId) await requireWorkspace(document.workspaceId);
  return document;
}

/**
 * The folder a new or moved item goes into: null for the workspace root,
 * otherwise a live folder of the same workspace.
 */
export async function resolveTargetFolder(
  workspaceId: string,
  folderId: string | null | undefined
): Promise<DmsFolderDocument | null> {
  if (!folderId) return null;
  return requireFolder(folderId, { workspaceId });
}

/** Ids of a folder and of every folder below it. */
export async function getSubtreeFolderIds(folderId: string) {
  const descendants = await DmsFolders.find(
    { ancestorIds: folderId },
    { fields: { _id: 1 } }
  ).fetchAsync();
  return [folderId, ...descendants.map(({ _id }) => _id)];
}

// ---------------------------------------------------------------------------
// Locks
// ---------------------------------------------------------------------------

export const isLockActive = (
  lock: DmsDocumentLock | undefined,
  now = new Date()
): lock is DmsDocumentLock =>
  !!lock && (!lock.expiresAt || lock.expiresAt > now);

export const isLockedByOther = (
  document: DmsDocumentDocument,
  userId: string,
  now = new Date()
) => isLockActive(document.lock, now) && document.lock!.userId !== userId;

/** Matches documents the user may change: unlocked, theirs, or expired. */
export const lockFreeSelector = (userId: string, now = new Date()) => ({
  $or: [
    { lock: { $exists: false } },
    { 'lock.userId': userId },
    { 'lock.expiresAt': { $lte: now } },
  ],
});

/** Matches documents another user holds an active lock on. */
export const lockedByOtherSelector = (userId: string, now = new Date()) => ({
  'lock.userId': { $exists: true, $ne: userId },
  $or: [
    { 'lock.expiresAt': { $exists: false } },
    { 'lock.expiresAt': { $gt: now } },
  ],
});

export const lockedError = (document: DmsDocumentDocument) =>
  dmsError('LOCKED', `"${document.name}" is checked out by another user`, {
    lockedBy: document.lock?.userId,
    lockedAt: document.lock?.lockedAt,
    lockExpiresAt: document.lock?.expiresAt,
  });

export function assertNotLockedByOther(
  document: DmsDocumentDocument,
  userId: string
) {
  if (isLockedByOther(document, userId)) throw lockedError(document);
}

/** Why a guarded write to a document matched nothing. */
export async function diagnoseDocumentWriteFailure(
  documentId: string,
  userId: string
) {
  const document = await DmsDocuments.findOneAsync(documentId);
  if (!document || document.trashed) {
    return dmsError('NOT_FOUND', 'Document not found');
  }
  if (isLockedByOther(document, userId)) return lockedError(document);
  return dmsError('CONFLICT', 'The document was changed by another request');
}

/**
 * Updates a live document unless another user holds its lock. The lock is
 * checked in the same write, so a lock taken concurrently can't be missed.
 */
export async function guardedDocumentUpdate(
  documentId: string,
  userId: string,
  modifier: Record<string, unknown>
) {
  const updated = await DmsDocuments.updateAsync(
    { _id: documentId, trashed: false, ...lockFreeSelector(userId) },
    modifier
  );
  if (!updated) throw await diagnoseDocumentWriteFailure(documentId, userId);
}

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

/** `dms-documents/<workspaceId>/<documentId>/<versionId>.<ext>` */
export const getVersionFileKey = (
  workspaceId: string,
  documentId: string,
  versionId: string,
  fileName: string,
  mimeType: string
) =>
  `${StorageFolders.Documents}/${workspaceId}/${documentId}/${versionId}.${getFileExtension(fileName, mimeType)}`;

/**
 * Deletes stored files after their records are gone. A leftover file is
 * harmless, so failures are only reported.
 */
export async function deleteFilesQuietly(keys: string[]) {
  if (!keys.length) return;
  try {
    await deleteFiles(keys);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`[dms] Could not delete ${keys.length} stored files`, error);
  }
}

// ---------------------------------------------------------------------------
// Paging and sorting
// ---------------------------------------------------------------------------

export interface DmsPageOptions {
  skip?: number;
  limit?: number;
}

export interface DmsPage<T> {
  data: T[];
  totalResults: number;
}

export function normalizePage({ skip, limit }: DmsPageOptions = {}) {
  const toInt = (value: unknown, fallback: number) =>
    Number.isFinite(value) ? Math.floor(value as number) : fallback;
  return {
    skip: Math.max(0, toInt(skip, 0)),
    limit: Math.min(
      DMS_MAX_PAGE_SIZE,
      Math.max(1, toInt(limit, DMS_DEFAULT_PAGE_SIZE))
    ),
  };
}

export type DmsDocumentSortField = 'name' | 'createdAt' | 'updatedAt' | 'size';
export type DmsSortOrder = 'asc' | 'desc';

export interface DmsSortOptions {
  sortBy?: DmsDocumentSortField;
  sortOrder?: DmsSortOrder;
}

const SORT_FIELDS: Record<DmsDocumentSortField, string> = {
  name: 'nameLower',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  size: 'size',
};

export function documentSort({
  sortBy = 'name',
  sortOrder = 'asc',
}: DmsSortOptions = {}): Record<string, 1 | -1> {
  const field = SORT_FIELDS[sortBy];
  if (!field) throw dmsError('BAD_USER_INPUT', `Cannot sort by ${sortBy}`);
  const direction = sortOrder === 'desc' ? -1 : 1;
  return { [field]: direction, _id: direction };
}
