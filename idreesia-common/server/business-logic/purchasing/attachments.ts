import { Random } from 'meteor/random';

import { EntityType, OperationType } from 'meteor/idreesia-common/constants/audit';
import {
  ALLOWED_ATTACHMENT_TYPES,
  ATTACHMENT_DOWNLOAD_URL_EXPIRY_SECONDS,
  ATTACHMENT_UPLOAD_URL_EXPIRY_SECONDS,
  AttachmentOwnerType,
  AttachmentStatus,
  MAX_ATTACHMENT_SIZE,
  type AttachmentOwnerTypeValue,
} from 'meteor/idreesia-common/constants/purchasing';
import {
  afterCommit,
  runInTransaction,
} from 'meteor/idreesia-common/server/collections';
import {
  PurchasingAttachments,
  PurchasingInvoices,
  PurchasingOrders,
  PurchasingPayments,
  PurchasingQuotes,
  PurchasingReceipts,
  PurchasingRequisitions,
  type PurchasingAttachmentDocument,
} from 'meteor/idreesia-common/server/collections/purchasing';
import {
  deleteFiles,
  getFileExtension,
  getFileInfo,
  getFileUrl,
  getUploadUrl,
  StorageFolders,
} from 'meteor/idreesia-common/server/file-storage';

import { purchasingError } from './errors';
import { audit, cleanText, requireText, type ActingUser } from './internal';

const OWNERS: Record<
  AttachmentOwnerTypeValue,
  { findOneAsync(selector: object): Promise<unknown> }
> = {
  [AttachmentOwnerType.REQUISITION]: PurchasingRequisitions,
  [AttachmentOwnerType.QUOTE]: PurchasingQuotes,
  [AttachmentOwnerType.ORDER]: PurchasingOrders,
  [AttachmentOwnerType.RECEIPT]: PurchasingReceipts,
  [AttachmentOwnerType.INVOICE]: PurchasingInvoices,
  [AttachmentOwnerType.PAYMENT]: PurchasingPayments,
};

const MIME_TYPE_PATTERN = /^[a-z0-9][a-z0-9!#$&^_.+-]*\/[a-z0-9][a-z0-9!#$&^_.+-]*$/;

const isMimeTypeAllowed = (mimeType: string) =>
  ALLOWED_ATTACHMENT_TYPES.some((pattern) =>
    pattern.endsWith('/*')
      ? mimeType.startsWith(pattern.slice(0, -1))
      : mimeType === pattern
  );

export interface AttachmentUploadInput {
  ownerType: AttachmentOwnerTypeValue;
  ownerId: string;
  fileName: string;
  mimeType: string;
  /** Exact size in bytes of the file that will be uploaded. */
  size: number;
  /** Defaults to the file name. */
  name?: string | null;
}

export interface AttachmentUploadTicket {
  uploadId: string;
  /** PUT the file here with the given Content-Type. */
  url: string;
  contentType: string;
}

function normalizeFile({ fileName, mimeType, size }: Pick<AttachmentUploadInput, 'fileName' | 'mimeType' | 'size'>) {
  const name = requireText(fileName, 'The file name', 255);
  if (name === '.' || name === '..' || /[/\\]/.test(name)) {
    throw purchasingError('BAD_USER_INPUT', 'The file name contains invalid characters.');
  }
  const type = (mimeType ?? '').split(';')[0].trim().toLowerCase();
  if (!MIME_TYPE_PATTERN.test(type)) {
    throw purchasingError('BAD_USER_INPUT', 'A valid file type is required.');
  }
  if (!isMimeTypeAllowed(type)) {
    throw purchasingError('BAD_USER_INPUT', `Files of type ${type} can't be attached.`);
  }
  if (!Number.isSafeInteger(size) || size <= 0) {
    throw purchasingError('BAD_USER_INPUT', 'A valid file size is required.');
  }
  if (size > MAX_ATTACHMENT_SIZE) {
    throw purchasingError('BAD_USER_INPUT', `Files can be at most ${MAX_ATTACHMENT_SIZE / (1024 * 1024)} MB.`);
  }
  return { fileName: name, mimeType: type };
}

async function requireOwner(ownerType: AttachmentOwnerTypeValue, ownerId: string) {
  const collection = OWNERS[ownerType];
  if (!collection) throw purchasingError('BAD_USER_INPUT', 'That can not have attachments.');
  const owner = await collection.findOneAsync({ _id: { $eq: ownerId } });
  if (!owner) throw purchasingError('NOT_FOUND', 'The document was not found.');
}

const fileKeyOf = (ownerType: string, ownerId: string, attachmentId: string, fileName: string, mimeType: string) =>
  `${StorageFolders.PurchasingAttachments}/${ownerType}/${ownerId}/${attachmentId}.${getFileExtension(fileName, mimeType)}`;

async function deleteFilesQuietly(keys: string[]) {
  if (!keys.length) return;
  try {
    await deleteFiles(keys);
  } catch (error) {
    // A leftover file is harmless, so it is only reported.
    // eslint-disable-next-line no-console
    console.error(`[purchasing] Could not delete ${keys.length} stored files`, error);
  }
}

export async function getAttachment(_id: string): Promise<PurchasingAttachmentDocument> {
  const attachment = await PurchasingAttachments.findOneAsync({
    _id: { $eq: _id },
    status: AttachmentStatus.READY,
  });
  if (!attachment) throw purchasingError('NOT_FOUND', 'Attachment not found.');
  return attachment;
}

/**
 * Starts a direct upload: returns a presigned URL the client PUTs the file to,
 * then finishes with completeAttachmentUpload. The attachment isn't listed
 * until then.
 */
export async function createAttachmentUpload(
  input: AttachmentUploadInput,
  user: ActingUser
): Promise<AttachmentUploadTicket> {
  const { fileName, mimeType } = normalizeFile(input);
  await requireOwner(input.ownerType, input.ownerId);
  const name = requireText(cleanText(input.name) ?? fileName, 'The attachment name', 255);

  const uploadId = Random.id();
  const fileKey = fileKeyOf(input.ownerType, input.ownerId, uploadId, fileName, mimeType);
  const url = await getUploadUrl(fileKey, mimeType, ATTACHMENT_UPLOAD_URL_EXPIRY_SECONDS);
  const now = new Date();
  await PurchasingAttachments.insertAsync({
    _id: uploadId,
    ownerType: input.ownerType,
    ownerId: input.ownerId,
    name,
    fileName,
    mimeType,
    size: input.size,
    fileKey,
    status: AttachmentStatus.PENDING,
    uploadExpiresAt: new Date(now.getTime() + ATTACHMENT_UPLOAD_URL_EXPIRY_SECONDS * 1000),
    createdAt: now,
    createdBy: user._id,
    updatedAt: now,
    updatedBy: user._id,
  });
  return { uploadId, url, contentType: mimeType };
}

/**
 * Finishes a direct upload once the file was PUT: checks what was stored and
 * makes the attachment visible. On failure the upload stays pending so it can
 * be retried or aborted.
 */
export async function completeAttachmentUpload(
  uploadId: string,
  user: ActingUser
): Promise<PurchasingAttachmentDocument> {
  return runInTransaction(async () => {
    const upload = await PurchasingAttachments.findOneAsync({
      _id: { $eq: uploadId },
      status: AttachmentStatus.PENDING,
    });
    if (!upload) throw purchasingError('NOT_FOUND', 'Upload not found.');
    if (upload.createdBy !== user._id) {
      throw purchasingError('FORBIDDEN', 'Only the user who started an upload can finish it.');
    }
    if (upload.uploadExpiresAt && upload.uploadExpiresAt <= new Date()) {
      throw purchasingError('BAD_USER_INPUT', 'The upload has expired. Start again.');
    }
    const info = await getFileInfo(upload.fileKey);
    if (!info) throw purchasingError('BAD_USER_INPUT', 'The file has not been uploaded yet.');
    if (info.size !== upload.size) {
      throw purchasingError('BAD_USER_INPUT', `The uploaded file is ${info.size} bytes, not the ${upload.size} declared.`);
    }

    const changed = await PurchasingAttachments.updateAsync(
      { _id: upload._id, status: AttachmentStatus.PENDING },
      {
        $set: { status: AttachmentStatus.READY, updatedAt: new Date(), updatedBy: user._id },
        $unset: { uploadExpiresAt: 1 },
      }
    );
    if (!changed) throw purchasingError('CONFLICT', 'The upload was already completed or aborted.');
    await audit(EntityType.PURCHASING_ATTACHMENT, upload._id, OperationType.CREATE, { ownerType: upload.ownerType, ownerId: upload.ownerId, name: upload.name }, user);
    return getAttachment(uploadId);
  });
}

/** Cancels a pending upload and removes anything already uploaded. */
export async function abortAttachmentUpload(uploadId: string, user: ActingUser): Promise<void> {
  await runInTransaction(async () => {
    const upload = await PurchasingAttachments.findOneAsync({
      _id: { $eq: uploadId },
      status: AttachmentStatus.PENDING,
    });
    if (!upload) throw purchasingError('NOT_FOUND', 'Upload not found.');
    if (upload.createdBy !== user._id) {
      throw purchasingError('FORBIDDEN', 'Only the user who started an upload can cancel it.');
    }
    await PurchasingAttachments.removeAsync({ _id: upload._id, status: AttachmentStatus.PENDING });
    await afterCommit(() => deleteFilesQuietly([upload.fileKey]));
  });
}

/** A document's attachments, oldest first. */
export async function listAttachments(
  ownerType: AttachmentOwnerTypeValue,
  ownerId: string
): Promise<PurchasingAttachmentDocument[]> {
  return PurchasingAttachments.find(
    { ownerType, ownerId, status: AttachmentStatus.READY },
    { sort: { createdAt: 1, _id: 1 } }
  ).fetchAsync();
}

export interface AttachmentDownload {
  url: string;
  fileName: string;
  mimeType: string;
}

/** A short-lived link that saves the file under its own name (or shows it inline). */
export async function getAttachmentDownload(
  _id: string,
  { inline = false }: { inline?: boolean } = {}
): Promise<AttachmentDownload> {
  const attachment = await getAttachment(_id);
  const url = await getFileUrl(attachment.fileKey, ATTACHMENT_DOWNLOAD_URL_EXPIRY_SECONDS, {
    downloadFileName: attachment.fileName,
    inline,
  });
  return { url, fileName: attachment.fileName, mimeType: attachment.mimeType };
}

/** Permanently deletes an attachment and its stored file. */
export async function deleteAttachment(_id: string, user: ActingUser): Promise<PurchasingAttachmentDocument> {
  return runInTransaction(async () => {
    const attachment = await getAttachment(_id);
    await PurchasingAttachments.removeAsync({ _id: attachment._id, status: AttachmentStatus.READY });
    await audit(EntityType.PURCHASING_ATTACHMENT, _id, OperationType.DELETE, { ownerType: attachment.ownerType, ownerId: attachment.ownerId, name: attachment.name }, user);
    await afterCommit(() => deleteFilesQuietly([attachment.fileKey]));
    return attachment;
  });
}

/**
 * Removes every attachment of a document that is being deleted, with their
 * stored files once the transaction commits. Call it inside that transaction.
 */
export async function deleteOwnerAttachments(
  ownerType: AttachmentOwnerTypeValue,
  ownerId: string
): Promise<void> {
  const attachments = await PurchasingAttachments.find({ ownerType, ownerId }).fetchAsync();
  if (attachments.length === 0) return;
  await PurchasingAttachments.removeAsync({ ownerType, ownerId });
  await afterCommit(() => deleteFilesQuietly(attachments.map((a) => a.fileKey)));
}
