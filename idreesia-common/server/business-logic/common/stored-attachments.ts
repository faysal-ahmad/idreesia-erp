import { Random } from 'meteor/random';

import {
  AttachmentCategory,
  type AttachmentCategoryValue,
} from 'meteor/idreesia-common/constants';
import { Attachments } from 'meteor/idreesia-common/server/collections/common';
import {
  getFile,
  getFileUrl,
  putFile,
  StorageFolders,
} from 'meteor/idreesia-common/server/file-storage';

/** Object storage folder for each upload category. */
export const ATTACHMENT_CATEGORY_FOLDERS: Record<
  AttachmentCategoryValue,
  string
> = {
  [AttachmentCategory.PURCHASE_FORM]: StorageFolders.PurchaseFormAttachments,
  [AttachmentCategory.ISSUANCE_FORM]: StorageFolders.IssuanceFormAttachments,
  [AttachmentCategory.PROFILE]: StorageFolders.ProfileAttachments,
};

export const isAttachmentCategory = (
  value: unknown
): value is AttachmentCategoryValue =>
  typeof value === 'string' && value in ATTACHMENT_CATEGORY_FOLDERS;

const MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
  'application/zip': 'zip',
  'application/x-zip-compressed': 'zip',
};

/** The original file's extension, else one for its MIME type. */
const getFileExtension = (name: string | undefined, mimeType: string) => {
  const fromName = name?.match(/\.([a-z0-9]{1,10})$/i)?.[1];
  if (fromName) return fromName.toLowerCase();
  return MIME_EXTENSIONS[mimeType?.toLowerCase()] ?? 'bin';
};

/** Key of an attachment's file: `<folder>/<attachmentId>.<ext>`. */
export const getAttachmentFileKey = (
  folder: string,
  attachmentId: string,
  name: string | undefined,
  mimeType: string
) => `${folder}/${attachmentId}.${getFileExtension(name, mimeType)}`;

interface AttachmentContent {
  data?: string;
  fileKey?: string;
}

/**
 * An attachment's bytes - from object storage, or from its legacy base64
 * `data` when it hasn't been migrated. Null when it has neither.
 */
export async function readAttachmentData(
  attachment: AttachmentContent | null | undefined
): Promise<Buffer | null> {
  if (attachment?.fileKey) return (await getFile(attachment.fileKey)).body;
  if (attachment?.data) return Buffer.from(attachment.data, 'base64');
  return null;
}

/**
 * Stores an uploaded file privately in its category's folder and records
 * it in Attachments (name, type and file key only - not its content).
 * Returns the new attachment id.
 */
export async function createStoredAttachment({
  category,
  name,
  mimeType,
  body,
}: {
  category: AttachmentCategoryValue;
  name?: string;
  mimeType: string;
  body: Buffer;
}): Promise<string> {
  const attachmentId = Random.id();
  const fileKey = getAttachmentFileKey(
    ATTACHMENT_CATEGORY_FOLDERS[category],
    attachmentId,
    name,
    mimeType
  );
  await putFile(fileKey, body, mimeType);

  const date = new Date();
  return Attachments.insertAsync({
    _id: attachmentId,
    name,
    mimeType,
    fileKey,
    createdAt: date,
    updatedAt: date,
  });
}

/** Short-lived presigned URL for downloading a stored attachment. */
export const getAttachmentDownloadUrl = (fileKey: string) =>
  getFileUrl(fileKey);
