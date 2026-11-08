import { createHash } from 'crypto';
import { Random } from 'meteor/random';

import {
  DmsAction,
  DmsEntityType,
  DmsVersionStatus,
} from 'meteor/idreesia-common/constants/dms';
import {
  DmsDocuments,
  DmsDocumentVersions,
  type DmsDocumentDocument,
  type DmsDocumentVersionDocument,
} from 'meteor/idreesia-common/server/collections/dms';
import { copyFile, putFile } from 'meteor/idreesia-common/server/file-storage';

import { logActivity } from './activity';
import { dmsError } from './errors';
import {
  assertNotLockedByOther,
  deleteFilesQuietly,
  diagnoseDocumentWriteFailure,
  getVersionFileKey,
  guardedDocumentUpdate,
  lockFreeSelector,
  normalizeMimeType,
  requireDocument,
  requireUserId,
  requireWorkspace,
  validateFile,
} from './internal';

export const sha256Of = (body: Buffer) =>
  createHash('sha256').update(body).digest('hex');

interface CommitVersionParams {
  document: DmsDocumentDocument;
  versionId: string;
  fileKey: string;
  fileName: string;
  mimeType: string;
  size: number;
  sha256?: string;
  etag?: string;
  comment?: string;
  restoredFromVersionId?: string;
  /** The version already exists as a pending upload. */
  pending?: boolean;
  userId: string;
}

/**
 * Records a stored file as the document's newest version. The version number
 * is reserved in the same write that checks the lock, so a document checked
 * out by someone else never gets a new version, and concurrent uploads get
 * distinct numbers. The document's current version only ever moves forward.
 */
export async function commitVersion({
  document,
  versionId,
  fileKey,
  fileName,
  mimeType,
  size,
  sha256,
  etag,
  comment,
  restoredFromVersionId,
  pending = false,
  userId,
}: CommitVersionParams): Promise<DmsDocumentVersionDocument> {
  const date = new Date();
  const reserved = await DmsDocuments.rawCollection().findOneAndUpdate(
    { _id: document._id, trashed: false, ...lockFreeSelector(userId, date) },
    { $inc: { versionCount: 1 } },
    { returnDocument: 'after' }
  );
  if (!reserved) {
    throw await diagnoseDocumentWriteFailure(document._id, userId);
  }
  const versionNumber = reserved.versionCount;

  const fields = {
    versionNumber,
    status: DmsVersionStatus.READY,
    fileName,
    mimeType,
    size,
    ...(sha256 ? { sha256 } : {}),
    ...(etag ? { etag } : {}),
    ...(comment ? { comment } : {}),
    ...(restoredFromVersionId ? { restoredFromVersionId } : {}),
    updatedAt: date,
    updatedBy: userId,
  };
  if (pending) {
    const completed = await DmsDocumentVersions.updateAsync(
      { _id: versionId, status: DmsVersionStatus.PENDING },
      { $set: fields, $unset: { uploadExpiresAt: 1, newDocument: 1 } }
    );
    if (!completed) {
      throw dmsError('CONFLICT', 'The upload was already completed or aborted');
    }
  } else {
    await DmsDocumentVersions.insertAsync({
      _id: versionId,
      workspaceId: document.workspaceId,
      documentId: document._id,
      fileKey,
      ...fields,
      createdAt: date,
      createdBy: userId,
    });
  }

  await DmsDocuments.updateAsync(
    {
      _id: document._id,
      $or: [
        { currentVersionNumber: { $exists: false } },
        { currentVersionNumber: { $lt: versionNumber } },
      ],
    },
    {
      $set: {
        currentVersionId: versionId,
        currentVersionNumber: versionNumber,
        fileName,
        mimeType,
        size,
        updatedAt: date,
        updatedBy: userId,
      },
    }
  );

  return (await DmsDocumentVersions.findOneAsync(versionId))!;
}

/**
 * Stores a file and commits it as a new version of the document, removing
 * the stored file again if the commit fails.
 */
export async function storeAndCommitVersion({
  document,
  body,
  fileName,
  mimeType,
  comment,
  userId,
}: {
  document: DmsDocumentDocument;
  body: Buffer;
  fileName: string;
  mimeType: string;
  comment?: string;
  userId: string;
}): Promise<DmsDocumentVersionDocument> {
  const versionId = Random.id();
  const fileKey = getVersionFileKey(
    document.workspaceId,
    document._id,
    versionId,
    fileName,
    mimeType
  );
  await putFile(fileKey, body, mimeType);
  try {
    return await commitVersion({
      document,
      versionId,
      fileKey,
      fileName,
      mimeType,
      size: body.length,
      sha256: sha256Of(body),
      comment,
      userId,
    });
  } catch (error) {
    await deleteFilesQuietly([fileKey]);
    throw error;
  }
}

export interface NewVersionInput {
  body: Buffer;
  mimeType: string;
  /** Defaults to the current version's file name. */
  fileName?: string;
  comment?: string;
}

/** Uploads a new version of a document through the server. */
export async function uploadNewVersion(
  documentId: string,
  { body, mimeType: rawMimeType, fileName, comment }: NewVersionInput,
  userId: string
): Promise<DmsDocumentVersionDocument> {
  requireUserId(userId);
  if (!Buffer.isBuffer(body)) {
    throw dmsError('BAD_USER_INPUT', 'File content is required');
  }
  const document = await requireDocument(documentId);
  assertNotLockedByOther(document, userId);
  const workspace = await requireWorkspace(document.workspaceId);
  const mimeType = normalizeMimeType(rawMimeType);
  validateFile(workspace, body.length, mimeType);

  const version = await storeAndCommitVersion({
    document,
    body,
    fileName: fileName?.trim() || document.fileName || document.name,
    mimeType,
    comment: comment?.trim() || undefined,
    userId,
  });

  await logActivity({
    workspaceId: document.workspaceId,
    entityType: DmsEntityType.VERSION,
    entityId: version._id,
    documentId,
    action: DmsAction.VERSION_ADDED,
    userId,
    details: { versionNumber: version.versionNumber, size: version.size },
  });
  return version;
}

/** A document's versions, newest first. */
export async function listVersions(
  documentId: string,
  userId: string
): Promise<DmsDocumentVersionDocument[]> {
  requireUserId(userId);
  await requireDocument(documentId, { includeTrashed: true });
  return DmsDocumentVersions.find(
    { documentId, status: DmsVersionStatus.READY },
    { sort: { versionNumber: -1 } }
  ).fetchAsync();
}

/** A ready version of the document - the current one when no id is given. */
export async function requireVersion(
  document: DmsDocumentDocument,
  versionId?: string
): Promise<DmsDocumentVersionDocument> {
  const id = versionId ?? document.currentVersionId;
  const version = id ? await DmsDocumentVersions.findOneAsync(id) : undefined;
  if (
    !version ||
    version.documentId !== document._id ||
    version.status !== DmsVersionStatus.READY
  ) {
    throw dmsError('NOT_FOUND', 'Version not found');
  }
  return version;
}

/**
 * Makes an old version current again by adding a copy of it as the newest
 * version, so history is never rewritten.
 */
export async function restoreVersion(
  documentId: string,
  versionId: string,
  userId: string,
  { comment }: { comment?: string } = {}
): Promise<DmsDocumentVersionDocument> {
  requireUserId(userId);
  const document = await requireDocument(documentId);
  assertNotLockedByOther(document, userId);
  const source = await requireVersion(document, versionId);

  const newVersionId = Random.id();
  const fileKey = getVersionFileKey(
    document.workspaceId,
    documentId,
    newVersionId,
    source.fileName,
    source.mimeType
  );
  await copyFile(source.fileKey, fileKey);

  let version: DmsDocumentVersionDocument;
  try {
    version = await commitVersion({
      document,
      versionId: newVersionId,
      fileKey,
      fileName: source.fileName,
      mimeType: source.mimeType,
      size: source.size,
      sha256: source.sha256,
      etag: source.etag,
      comment:
        comment?.trim() || `Restored from version ${source.versionNumber}`,
      restoredFromVersionId: source._id,
      userId,
    });
  } catch (error) {
    await deleteFilesQuietly([fileKey]);
    throw error;
  }

  await logActivity({
    workspaceId: document.workspaceId,
    entityType: DmsEntityType.VERSION,
    entityId: version._id,
    documentId,
    action: DmsAction.VERSION_RESTORED,
    userId,
    details: {
      versionNumber: version.versionNumber,
      restoredFromVersionNumber: source.versionNumber,
    },
  });
  return version;
}

/** Permanently deletes an old version. The current version can't be deleted. */
export async function deleteVersion(
  documentId: string,
  versionId: string,
  userId: string
): Promise<void> {
  requireUserId(userId);
  const document = await requireDocument(documentId);
  const version = await requireVersion(document, versionId);
  if (version._id === document.currentVersionId) {
    throw dmsError('CONFLICT', 'The current version cannot be deleted');
  }

  // Checks the lock in the same write. An old version can't become current
  // again (restoring adds a copy), so the check above still holds.
  await guardedDocumentUpdate(documentId, userId, {
    $set: { updatedAt: new Date(), updatedBy: userId },
  });

  await DmsDocumentVersions.removeAsync(version._id);
  await deleteFilesQuietly([version.fileKey]);

  await logActivity({
    workspaceId: document.workspaceId,
    entityType: DmsEntityType.VERSION,
    entityId: version._id,
    documentId,
    action: DmsAction.VERSION_DELETED,
    userId,
    details: { versionNumber: version.versionNumber },
  });
}
