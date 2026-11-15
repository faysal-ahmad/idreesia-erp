import { afterCommit } from 'meteor/idreesia-common/server/collections';
import { Random } from 'meteor/random';

import {
  AttachmentCategory,
  type AttachmentCategoryValue,
} from 'meteor/idreesia-common/constants';
import { Attachments } from 'meteor/idreesia-common/server/collections/common';
import {
  deleteFiles,
  getFileExtension,
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

/** Key of an attachment's file: `<folder>/<attachmentId>.<ext>`. */
export const getAttachmentFileKey = (
  folder: string,
  attachmentId: string,
  name: string | undefined,
  mimeType: string
) => `${folder}/${attachmentId}.${getFileExtension(name, mimeType)}`;

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

/**
 * Deletes attachments, and their files in object storage once the current
 * transaction commits (straight away outside one).
 */
export async function removeAttachments(
  attachmentIds: string[] | null | undefined
): Promise<void> {
  const ids = (attachmentIds ?? []).filter(Boolean);
  if (ids.length === 0) return;

  const attachments = await Attachments.find(
    { _id: { $in: ids } },
    { fields: { fileKey: 1 } }
  ).fetchAsync();
  const fileKeys = attachments
    .map(attachment => attachment.fileKey)
    .filter(Boolean);
  await Attachments.removeAsync({ _id: { $in: ids } });
  if (fileKeys.length > 0) {
    await afterCommit(async () => {
      try {
        await deleteFiles(fileKeys);
      } catch (error) {
        // An orphaned file is harmless; failing the removal over it is not.
        // eslint-disable-next-line no-console
        console.error(`Failed to delete attachment files ${fileKeys}:`, error);
      }
    });
  }
}

/** Deletes an attachment and its file in object storage. */
export const removeAttachment = (attachmentId: string) =>
  removeAttachments([attachmentId]);
