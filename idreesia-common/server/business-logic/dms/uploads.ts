import { Random } from 'meteor/random';

import {
  DMS_UPLOAD_URL_EXPIRY_SECONDS,
  DmsAction,
  DmsEntityType,
  DmsVersionStatus,
} from 'meteor/idreesia-common/constants/dms';
import {
  DmsDocuments,
  DmsDocumentVersions,
  type DmsDocumentDocument,
  type DmsDocumentVersionDocument,
  type DmsMetadata,
} from 'meteor/idreesia-common/server/collections/dms';
import {
  getFileInfo,
  getUploadUrl,
} from 'meteor/idreesia-common/server/file-storage';

import { logActivity } from './activity';
import {
  buildNewDocumentSpec,
  documentNameConflict,
  insertDocument,
  type DocumentWithVersion,
} from './documents';
import { dmsError } from './errors';
import {
  assertNotLockedByOther,
  deleteFilesQuietly,
  getVersionFileKey,
  normalizeMimeType,
  normalizeName,
  requireDocument,
  requireUserId,
  requireWorkspace,
  validateFile,
} from './internal';
import { commitVersion } from './versions';
import { notifyDocumentAdded, notifyVersionAdded } from './notifications';

export interface CreateUploadInput {
  workspaceId: string;
  /** Upload a new version of this document. Unset to create a document. */
  documentId?: string;
  fileName: string;
  mimeType: string;
  /** Exact size in bytes of the file that will be uploaded. */
  size: number;
  comment?: string;
  // New documents only:
  /** Unset or null for the workspace root. */
  folderId?: string | null;
  /** Defaults to the file name. */
  name?: string;
  description?: string;
  tags?: string[];
  metadata?: DmsMetadata;
}

export interface UploadTicket {
  uploadId: string;
  documentId: string;
  /** PUT the file here, with the headers below. */
  url: string;
  method: 'PUT';
  headers: Record<string, string>;
  expiresAt: Date;
}

/**
 * Starts a direct upload: returns a presigned URL the client PUTs the file
 * to, then calls completeUpload with the uploadId. Nothing is visible until
 * the upload is completed.
 */
export async function createUploadUrl(
  input: CreateUploadInput,
  userId: string
): Promise<UploadTicket> {
  requireUserId(userId);
  const workspace = await requireWorkspace(input.workspaceId);
  const fileName = normalizeName(input.fileName, 'File name').name;
  const mimeType = normalizeMimeType(input.mimeType);
  validateFile(workspace, input.size, mimeType);

  let documentId: string;
  let newDocument;
  if (input.documentId) {
    const document = await requireDocument(input.documentId, {
      workspaceId: workspace._id,
    });
    assertNotLockedByOther(document, userId);
    documentId = document._id;
  } else {
    newDocument = await buildNewDocumentSpec(workspace._id, {
      ...input,
      name: input.name ?? fileName,
    });
    // Checked again on completion; this just fails early.
    const existing = await DmsDocuments.findOneAsync(
      {
        workspaceId: workspace._id,
        folderId: newDocument.folderId ?? null,
        nameLower: newDocument.nameLower,
        trashed: false,
      },
      { fields: { _id: 1 } }
    );
    if (existing) throw documentNameConflict(newDocument.name);
    documentId = Random.id();
  }

  const uploadId = Random.id();
  const fileKey = getVersionFileKey(
    workspace._id,
    documentId,
    uploadId,
    fileName,
    mimeType
  );
  const url = await getUploadUrl(
    fileKey,
    mimeType,
    DMS_UPLOAD_URL_EXPIRY_SECONDS
  );
  const date = new Date();
  const expiresAt = new Date(
    date.getTime() + DMS_UPLOAD_URL_EXPIRY_SECONDS * 1000
  );
  const comment = input.comment?.trim();

  await DmsDocumentVersions.insertAsync({
    _id: uploadId,
    workspaceId: workspace._id,
    documentId,
    status: DmsVersionStatus.PENDING,
    fileKey,
    fileName,
    mimeType,
    size: input.size,
    ...(comment ? { comment } : {}),
    uploadExpiresAt: expiresAt,
    ...(newDocument ? { newDocument } : {}),
    createdAt: date,
    createdBy: userId,
    updatedAt: date,
    updatedBy: userId,
  });

  return {
    uploadId,
    documentId,
    url,
    method: 'PUT',
    headers: { 'Content-Type': mimeType },
    expiresAt,
  };
}

/** A pending upload started by this user. */
async function requirePendingUpload(
  uploadId: string,
  userId: string
): Promise<DmsDocumentVersionDocument> {
  const upload = uploadId
    ? await DmsDocumentVersions.findOneAsync(uploadId)
    : undefined;
  if (!upload || upload.status !== DmsVersionStatus.PENDING) {
    throw dmsError('NOT_FOUND', 'Upload not found');
  }
  if (upload.createdBy !== userId) {
    throw dmsError(
      'FORBIDDEN',
      'Only the user who started an upload can finish it'
    );
  }
  return upload;
}

const SHA256_PATTERN = /^[a-f0-9]{64}$/i;

/**
 * Finishes a direct upload once the file has been PUT: checks the stored
 * file, then creates the document or adds the version.
 */
export async function completeUpload(
  uploadId: string,
  userId: string,
  { sha256 }: { sha256?: string } = {}
): Promise<DocumentWithVersion> {
  requireUserId(userId);
  const upload = await requirePendingUpload(uploadId, userId);
  if (upload.uploadExpiresAt && upload.uploadExpiresAt <= new Date()) {
    throw dmsError('UPLOAD_INCOMPLETE', 'The upload has expired');
  }
  if (sha256 !== undefined && !SHA256_PATTERN.test(sha256)) {
    throw dmsError('BAD_USER_INPUT', 'sha256 must be a hex SHA-256 digest');
  }
  const workspace = await requireWorkspace(upload.workspaceId);

  const info = await getFileInfo(upload.fileKey);
  if (!info) {
    throw dmsError('UPLOAD_INCOMPLETE', 'The file has not been uploaded yet');
  }
  if (info.size !== upload.size) {
    throw dmsError(
      'UPLOAD_INCOMPLETE',
      `The uploaded file is ${info.size} bytes, not the ${upload.size} declared`
    );
  }
  validateFile(workspace, info.size, upload.mimeType);

  const isNewDocument = !!upload.newDocument;
  let document: DmsDocumentDocument;
  if (upload.newDocument) {
    document = await insertDocument(
      workspace._id,
      upload.newDocument,
      userId,
      upload.documentId
    );
  } else {
    document = await requireDocument(upload.documentId, {
      workspaceId: workspace._id,
    });
  }

  let version: DmsDocumentVersionDocument;
  try {
    version = await commitVersion({
      document,
      versionId: upload._id,
      fileKey: upload.fileKey,
      fileName: upload.fileName,
      mimeType: upload.mimeType,
      size: info.size,
      sha256: sha256?.toLowerCase(),
      etag: info.etag,
      comment: upload.comment,
      pending: true,
      userId,
    });
  } catch (error) {
    // The upload stays pending, so it can be retried or aborted.
    if (isNewDocument) {
      await DmsDocuments.removeAsync(document._id).catch(() => undefined);
    }
    throw error;
  }

  await logActivity(
    isNewDocument
      ? {
          workspaceId: workspace._id,
          entityType: DmsEntityType.DOCUMENT,
          entityId: document._id,
          documentId: document._id,
          action: DmsAction.DOCUMENT_CREATED,
          userId,
          details: {
            name: document.name,
            folderId: document.folderId ?? null,
          },
        }
      : {
          workspaceId: workspace._id,
          entityType: DmsEntityType.VERSION,
          entityId: version._id,
          documentId: document._id,
          action: DmsAction.VERSION_ADDED,
          userId,
          details: { versionNumber: version.versionNumber, size: version.size },
        }
  );
  if (isNewDocument) await notifyDocumentAdded(document, userId);
  else await notifyVersionAdded(document, version.versionNumber, userId);
  return { document: await requireDocument(document._id), version };
}

/** Cancels a pending upload and removes anything already uploaded. */
export async function abortUpload(
  uploadId: string,
  userId: string
): Promise<void> {
  requireUserId(userId);
  const upload = await requirePendingUpload(uploadId, userId);
  await DmsDocumentVersions.removeAsync({
    _id: upload._id,
    status: DmsVersionStatus.PENDING,
  });
  await deleteFilesQuietly([upload.fileKey]);
}

/**
 * Removes pending uploads whose URL has expired, with any files already
 * uploaded. Maintenance only - meant for a job or an admin action.
 * Returns how many were removed.
 */
export async function purgeExpiredUploads(): Promise<number> {
  const expired = await DmsDocumentVersions.find(
    {
      status: DmsVersionStatus.PENDING,
      uploadExpiresAt: { $lte: new Date() },
    },
    { fields: { _id: 1, fileKey: 1 } }
  ).fetchAsync();
  if (!expired.length) return 0;

  await DmsDocumentVersions.removeAsync({
    _id: { $in: expired.map(({ _id }) => _id) },
    status: DmsVersionStatus.PENDING,
  });
  await deleteFilesQuietly(expired.map(({ fileKey }) => fileKey));
  return expired.length;
}
