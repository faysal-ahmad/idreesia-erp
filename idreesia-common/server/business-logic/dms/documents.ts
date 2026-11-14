import { Random } from 'meteor/random';

import {
  DMS_DOWNLOAD_URL_EXPIRY_SECONDS,
  DmsAction,
  DmsEntityType,
} from 'meteor/idreesia-common/constants/dms';
import {
  DmsDocuments,
  DmsDocumentVersions,
  type DmsDocumentDocument,
  type DmsDocumentVersionDocument,
  type DmsMetadata,
  type DmsNewDocumentSpec,
} from 'meteor/idreesia-common/server/collections/dms';
import {
  copyFile,
  getFile,
  getFileUrl,
} from 'meteor/idreesia-common/server/file-storage';

import { logActivity } from './activity';
import { dmsError, isDuplicateKeyError } from './errors';
import {
  assertNotLockedByOther,
  deleteFilesQuietly,
  getVersionFileKey,
  guardedDocumentUpdate,
  normalizeMimeType,
  normalizeName,
  normalizeTags,
  requireDocument,
  requireUserId,
  requireWorkspace,
  resolveTargetFolder,
  validateFile,
  validateMetadata,
} from './internal';
import {
  commitVersion,
  requireVersion,
  storeAndCommitVersion,
} from './versions';
import { notifyDocumentAdded } from './notifications';

export const documentNameConflict = (name: string) =>
  dmsError('CONFLICT', `A document named "${name}" already exists here`);

/** Validated fields of a document about to be created. */
export async function buildNewDocumentSpec(
  workspaceId: string,
  input: {
    folderId?: string | null;
    name: string;
    description?: string;
    tags?: string[];
    metadata?: DmsMetadata;
  }
): Promise<DmsNewDocumentSpec> {
  const folder = await resolveTargetFolder(workspaceId, input.folderId);
  const { name, nameLower } = normalizeName(input.name, 'Document name');
  const description = input.description?.trim();
  const metadata = validateMetadata(input.metadata);
  return {
    ...(folder ? { folderId: folder._id } : {}),
    name,
    nameLower,
    ...(description ? { description } : {}),
    tags: normalizeTags(input.tags),
    ...(metadata ? { metadata } : {}),
  };
}

/**
 * Inserts a document with no versions yet. It stays out of listings and
 * search until its first version is committed.
 */
export async function insertDocument(
  workspaceId: string,
  spec: DmsNewDocumentSpec,
  userId: string,
  documentId: string = Random.id()
): Promise<DmsDocumentDocument> {
  const date = new Date();
  try {
    await DmsDocuments.insertAsync({
      _id: documentId,
      workspaceId,
      ...spec,
      versionCount: 0,
      trashed: false,
      createdAt: date,
      createdBy: userId,
      updatedAt: date,
      updatedBy: userId,
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) throw documentNameConflict(spec.name);
    throw error;
  }
  return (await DmsDocuments.findOneAsync(documentId))!;
}

/** Removes a document whose first version could not be committed. */
export async function removeIncompleteDocument(documentId: string) {
  try {
    await DmsDocumentVersions.removeAsync({ documentId });
    await DmsDocuments.removeAsync(documentId);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[dms] Could not remove incomplete document', error);
  }
}

export interface UploadDocumentInput {
  workspaceId: string;
  /** Unset or null for the workspace root. */
  folderId?: string | null;
  /** Defaults to the file name. */
  name?: string;
  fileName: string;
  body: Buffer;
  mimeType: string;
  description?: string;
  tags?: string[];
  metadata?: DmsMetadata;
  comment?: string;
}

export interface DocumentWithVersion {
  document: DmsDocumentDocument;
  version: DmsDocumentVersionDocument;
}

/** Creates a document from a file uploaded through the server. */
export async function uploadDocument(
  input: UploadDocumentInput,
  userId: string
): Promise<DocumentWithVersion> {
  requireUserId(userId);
  if (!Buffer.isBuffer(input.body)) {
    throw dmsError('BAD_USER_INPUT', 'File content is required');
  }
  const workspace = await requireWorkspace(input.workspaceId);
  const fileName = normalizeName(input.fileName, 'File name').name;
  const mimeType = normalizeMimeType(input.mimeType);
  validateFile(workspace, input.body.length, mimeType);
  const spec = await buildNewDocumentSpec(workspace._id, {
    ...input,
    name: input.name ?? fileName,
  });

  const created = await insertDocument(workspace._id, spec, userId);
  let version: DmsDocumentVersionDocument;
  try {
    version = await storeAndCommitVersion({
      document: created,
      body: input.body,
      fileName,
      mimeType,
      comment: input.comment?.trim() || undefined,
      userId,
    });
  } catch (error) {
    await removeIncompleteDocument(created._id);
    throw error;
  }

  await logActivity({
    workspaceId: workspace._id,
    entityType: DmsEntityType.DOCUMENT,
    entityId: created._id,
    documentId: created._id,
    action: DmsAction.DOCUMENT_CREATED,
    userId,
    details: { name: spec.name, folderId: spec.folderId ?? null },
  });
  await notifyDocumentAdded(created, userId);
  return { document: await requireDocument(created._id), version };
}

export async function getDocument(
  documentId: string,
  userId: string,
  { includeTrashed = false }: { includeTrashed?: boolean } = {}
): Promise<DmsDocumentDocument> {
  requireUserId(userId);
  return requireDocument(documentId, { includeTrashed });
}

export interface UpdateDocumentInput {
  name?: string;
  /** null clears it. */
  description?: string | null;
  /** Replaces all tags. */
  tags?: string[];
  /** Replaces the whole object; null clears it. */
  metadata?: DmsMetadata | null;
}

/** Changes a document's name, description, tags or metadata. */
export async function updateDocument(
  documentId: string,
  changes: UpdateDocumentInput,
  userId: string
): Promise<DmsDocumentDocument> {
  requireUserId(userId);
  const document = await requireDocument(documentId);
  assertNotLockedByOther(document, userId);

  const $set: Partial<DmsDocumentDocument> = {
    updatedAt: new Date(),
    updatedBy: userId,
  };
  const $unset: Record<string, 1> = {};
  if (changes.name !== undefined) {
    Object.assign($set, normalizeName(changes.name, 'Document name'));
  }
  if (changes.description !== undefined) {
    const description = changes.description?.trim();
    if (description) $set.description = description;
    else $unset.description = 1;
  }
  if (changes.tags !== undefined) $set.tags = normalizeTags(changes.tags);
  if (changes.metadata !== undefined) {
    const metadata = validateMetadata(changes.metadata);
    if (metadata) $set.metadata = metadata;
    else $unset.metadata = 1;
  }

  try {
    await guardedDocumentUpdate(documentId, userId, {
      $set,
      ...(Object.keys($unset).length ? { $unset } : {}),
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw documentNameConflict($set.name ?? document.name);
    }
    throw error;
  }

  await logActivity({
    workspaceId: document.workspaceId,
    entityType: DmsEntityType.DOCUMENT,
    entityId: documentId,
    documentId,
    action: DmsAction.DOCUMENT_UPDATED,
    userId,
    details: {
      changed: Object.keys(changes),
      ...($set.name && $set.name !== document.name
        ? { from: document.name, to: $set.name }
        : {}),
    },
  });
  return requireDocument(documentId);
}

/** Moves a document to another folder, or to the root with null. */
export async function moveDocument(
  documentId: string,
  targetFolderId: string | null,
  userId: string
): Promise<DmsDocumentDocument> {
  requireUserId(userId);
  const document = await requireDocument(documentId);
  assertNotLockedByOther(document, userId);
  const target = await resolveTargetFolder(
    document.workspaceId,
    targetFolderId
  );
  if ((target?._id ?? null) === (document.folderId ?? null)) return document;

  try {
    await guardedDocumentUpdate(documentId, userId, {
      $set: {
        updatedAt: new Date(),
        updatedBy: userId,
        ...(target ? { folderId: target._id } : {}),
      },
      ...(target ? {} : { $unset: { folderId: 1 } }),
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) throw documentNameConflict(document.name);
    throw error;
  }

  await logActivity({
    workspaceId: document.workspaceId,
    entityType: DmsEntityType.DOCUMENT,
    entityId: documentId,
    documentId,
    action: DmsAction.DOCUMENT_MOVED,
    userId,
    details: { from: document.folderId ?? null, to: target?._id ?? null },
  });
  return requireDocument(documentId);
}

/** "report.pdf" -> "report (copy).pdf" */
const copyName = (name: string) => {
  const match = name.match(/^(.+?)(\.[^.]{1,10})?$/);
  return `${match?.[1] ?? name} (copy)${match?.[2] ?? ''}`;
};

/**
 * Copies a document's current version (only) into a new document, in the
 * same or another folder of the same workspace.
 */
export async function copyDocument(
  documentId: string,
  userId: string,
  {
    targetFolderId,
    name,
  }: {
    /** Unset for the same folder; null for the root. */
    targetFolderId?: string | null;
    /** Defaults to "<name> (copy)". */
    name?: string;
  } = {}
): Promise<DocumentWithVersion> {
  requireUserId(userId);
  const source = await requireDocument(documentId);
  const sourceVersion = await requireVersion(source);

  const spec = await buildNewDocumentSpec(source.workspaceId, {
    folderId: targetFolderId === undefined ? source.folderId : targetFolderId,
    name: name ?? copyName(source.name),
    description: source.description,
    tags: source.tags,
    metadata: source.metadata,
  });
  const created = await insertDocument(source.workspaceId, spec, userId);

  const versionId = Random.id();
  const fileKey = getVersionFileKey(
    created.workspaceId,
    created._id,
    versionId,
    sourceVersion.fileName,
    sourceVersion.mimeType
  );
  let version: DmsDocumentVersionDocument;
  try {
    await copyFile(sourceVersion.fileKey, fileKey);
    version = await commitVersion({
      document: created,
      versionId,
      fileKey,
      fileName: sourceVersion.fileName,
      mimeType: sourceVersion.mimeType,
      size: sourceVersion.size,
      sha256: sourceVersion.sha256,
      etag: sourceVersion.etag,
      comment: `Copied from "${source.name}" version ${sourceVersion.versionNumber}`,
      userId,
    });
  } catch (error) {
    await removeIncompleteDocument(created._id);
    await deleteFilesQuietly([fileKey]);
    throw error;
  }

  await logActivity({
    workspaceId: created.workspaceId,
    entityType: DmsEntityType.DOCUMENT,
    entityId: created._id,
    documentId: created._id,
    action: DmsAction.DOCUMENT_COPIED,
    userId,
    details: {
      sourceDocumentId: source._id,
      sourceVersionNumber: sourceVersion.versionNumber,
      name: spec.name,
    },
  });
  await notifyDocumentAdded(created, userId);
  return { document: await requireDocument(created._id), version };
}

export interface DownloadOptions {
  /** Defaults to the current version. */
  versionId?: string;
  /** Show in the browser instead of downloading. */
  inline?: boolean;
  expiresInSec?: number;
}

export interface DocumentDownload {
  url: string;
  expiresAt: Date;
  fileName: string;
  mimeType: string;
  size: number;
  versionId: string;
  versionNumber?: number;
}

/** A short-lived presigned URL for a version of a (non-trashed) document. */
export async function getDocumentDownloadUrl(
  documentId: string,
  userId: string,
  {
    versionId,
    inline = false,
    expiresInSec = DMS_DOWNLOAD_URL_EXPIRY_SECONDS,
  }: DownloadOptions = {}
): Promise<DocumentDownload> {
  requireUserId(userId);
  const document = await requireDocument(documentId);
  const version = await requireVersion(document, versionId);
  const url = await getFileUrl(version.fileKey, expiresInSec, {
    downloadFileName: version.fileName,
    inline,
  });

  await logActivity({
    workspaceId: document.workspaceId,
    entityType: DmsEntityType.VERSION,
    entityId: version._id,
    documentId,
    action: DmsAction.DOCUMENT_DOWNLOADED,
    userId,
    details: { versionNumber: version.versionNumber },
  });
  return {
    url,
    expiresAt: new Date(Date.now() + expiresInSec * 1000),
    fileName: version.fileName,
    mimeType: version.mimeType,
    size: version.size,
    versionId: version._id,
    versionNumber: version.versionNumber,
  };
}

/** Reads a version's bytes on the server (e.g. to stream or process them). */
export async function readDocumentContent(
  documentId: string,
  userId: string,
  { versionId }: { versionId?: string } = {}
): Promise<{
  body: Buffer;
  fileName: string;
  mimeType: string;
  version: DmsDocumentVersionDocument;
}> {
  requireUserId(userId);
  const document = await requireDocument(documentId);
  const version = await requireVersion(document, versionId);
  const { body } = await getFile(version.fileKey);

  await logActivity({
    workspaceId: document.workspaceId,
    entityType: DmsEntityType.VERSION,
    entityId: version._id,
    documentId,
    action: DmsAction.DOCUMENT_DOWNLOADED,
    userId,
    details: { versionNumber: version.versionNumber, viaServer: true },
  });
  return {
    body,
    fileName: version.fileName,
    mimeType: version.mimeType,
    version,
  };
}
