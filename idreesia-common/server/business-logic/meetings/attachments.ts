import { createHash } from 'crypto';
import { Random } from 'meteor/random';

import {
  MEETINGS_DOWNLOAD_URL_EXPIRY_SECONDS,
  MEETINGS_UPLOAD_URL_EXPIRY_SECONDS,
  MeetingAttachmentStatus,
  MeetingsAction,
  MeetingsEntityType,
} from 'meteor/idreesia-common/constants/meetings';
import {
  MeetingAttachments,
  Meetings,
  type MeetingAttachmentDocument,
  type MeetingDocument,
} from 'meteor/idreesia-common/server/collections/meetings';
import {
  getFile,
  getFileInfo,
  getFileUrl,
  getUploadUrl,
  putFile,
} from 'meteor/idreesia-common/server/file-storage';

import { logActivity } from './activity';
import { meetingsError } from './errors';
import {
  assertStatus,
  deleteFilesQuietly,
  EDITABLE_STATUSES,
  getAttachmentFileKey,
  normalizeFileName,
  normalizeMimeType,
  normalizeText,
  normalizeTitle,
  requireMeeting,
  requireUserId,
  requireWorkspace,
  validateFile,
} from './internal';

const sha256Of = (body: Buffer) =>
  createHash('sha256').update(body).digest('hex');

const SHA256_PATTERN = /^[a-f0-9]{64}$/i;

/** A meeting that can take new or changed attachments (not cancelled). */
async function requireEditableMeeting(meetingId: string) {
  const meeting = await requireMeeting(meetingId);
  assertStatus(meeting, EDITABLE_STATUSES);
  return meeting;
}

/** A completed (not pending) attachment in a live workspace. */
async function requireAttachment(
  attachmentId: string
): Promise<MeetingAttachmentDocument> {
  const attachment = attachmentId
    ? await MeetingAttachments.findOneAsync(attachmentId)
    : undefined;
  if (!attachment || attachment.status !== MeetingAttachmentStatus.READY) {
    throw meetingsError('NOT_FOUND', 'Attachment not found');
  }
  await requireMeeting(attachment.meetingId).catch(() => {
    throw meetingsError('NOT_FOUND', 'Attachment not found');
  });
  return attachment;
}

const changeAttachmentCount = (meetingId: string, by: number) =>
  Meetings.updateAsync(meetingId, { $inc: { attachmentCount: by } });

const logAttachmentAdded = (
  meeting: MeetingDocument,
  attachment: Pick<MeetingAttachmentDocument, '_id' | 'name' | 'size'>,
  userId: string
) =>
  logActivity({
    workspaceId: meeting.workspaceId,
    meetingId: meeting._id,
    entityType: MeetingsEntityType.ATTACHMENT,
    entityId: attachment._id,
    action: MeetingsAction.ATTACHMENT_ADDED,
    userId,
    details: { name: attachment.name, size: attachment.size },
  });

export interface UploadAttachmentInput {
  meetingId: string;
  fileName: string;
  body: Buffer;
  mimeType: string;
  /** Defaults to the file name. */
  name?: string;
  description?: string;
}

/** Stores a file through the server and attaches it to the meeting. */
export async function uploadAttachment(
  input: UploadAttachmentInput,
  userId: string
): Promise<MeetingAttachmentDocument> {
  requireUserId(userId);
  if (!Buffer.isBuffer(input.body)) {
    throw meetingsError('BAD_USER_INPUT', 'The file content must be a Buffer');
  }
  const meeting = await requireEditableMeeting(input.meetingId);
  const workspace = await requireWorkspace(meeting.workspaceId);
  const fileName = normalizeFileName(input.fileName);
  const mimeType = normalizeMimeType(input.mimeType);
  validateFile(workspace, input.body.length, mimeType);
  const name = normalizeTitle(input.name ?? fileName, 'Attachment name');
  const description = normalizeText(input.description, 'Description');

  const attachmentId = Random.id();
  const fileKey = getAttachmentFileKey(
    meeting.workspaceId,
    meeting._id,
    attachmentId,
    fileName,
    mimeType
  );
  await putFile(fileKey, input.body, mimeType);

  const date = new Date();
  try {
    await MeetingAttachments.insertAsync({
      _id: attachmentId,
      workspaceId: meeting.workspaceId,
      meetingId: meeting._id,
      name,
      ...(description ? { description } : {}),
      fileName,
      mimeType,
      size: input.body.length,
      fileKey,
      sha256: sha256Of(input.body),
      status: MeetingAttachmentStatus.READY,
      createdAt: date,
      createdBy: userId,
      updatedAt: date,
      updatedBy: userId,
    });
  } catch (error) {
    await deleteFilesQuietly([fileKey]);
    throw error;
  }
  await changeAttachmentCount(meeting._id, 1);
  await logAttachmentAdded(
    meeting,
    { _id: attachmentId, name, size: input.body.length },
    userId
  );
  return requireAttachment(attachmentId);
}

export interface CreateAttachmentUploadInput {
  meetingId: string;
  fileName: string;
  mimeType: string;
  /** Exact size in bytes of the file that will be uploaded. */
  size: number;
  /** Defaults to the file name. */
  name?: string;
  description?: string;
}

export interface AttachmentUploadTicket {
  uploadId: string;
  /** The attachment's id once the upload is completed. */
  attachmentId: string;
  /** PUT the file here, with the headers below. */
  url: string;
  method: 'PUT';
  headers: Record<string, string>;
  expiresAt: Date;
}

/**
 * Starts a direct upload: returns a presigned URL the client PUTs the file
 * to, then calls completeAttachmentUpload with the uploadId. The attachment
 * isn't listed until the upload is completed.
 */
export async function createAttachmentUploadUrl(
  input: CreateAttachmentUploadInput,
  userId: string
): Promise<AttachmentUploadTicket> {
  requireUserId(userId);
  const meeting = await requireEditableMeeting(input.meetingId);
  const workspace = await requireWorkspace(meeting.workspaceId);
  const fileName = normalizeFileName(input.fileName);
  const mimeType = normalizeMimeType(input.mimeType);
  validateFile(workspace, input.size, mimeType);
  const name = normalizeTitle(input.name ?? fileName, 'Attachment name');
  const description = normalizeText(input.description, 'Description');

  const uploadId = Random.id();
  const fileKey = getAttachmentFileKey(
    meeting.workspaceId,
    meeting._id,
    uploadId,
    fileName,
    mimeType
  );
  const url = await getUploadUrl(
    fileKey,
    mimeType,
    MEETINGS_UPLOAD_URL_EXPIRY_SECONDS
  );
  const date = new Date();
  const expiresAt = new Date(
    date.getTime() + MEETINGS_UPLOAD_URL_EXPIRY_SECONDS * 1000
  );

  await MeetingAttachments.insertAsync({
    _id: uploadId,
    workspaceId: meeting.workspaceId,
    meetingId: meeting._id,
    name,
    ...(description ? { description } : {}),
    fileName,
    mimeType,
    size: input.size,
    fileKey,
    status: MeetingAttachmentStatus.PENDING,
    uploadExpiresAt: expiresAt,
    createdAt: date,
    createdBy: userId,
    updatedAt: date,
    updatedBy: userId,
  });

  return {
    uploadId,
    attachmentId: uploadId,
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
): Promise<MeetingAttachmentDocument> {
  const upload = uploadId
    ? await MeetingAttachments.findOneAsync(uploadId)
    : undefined;
  if (!upload || upload.status !== MeetingAttachmentStatus.PENDING) {
    throw meetingsError('NOT_FOUND', 'Upload not found');
  }
  if (upload.createdBy !== userId) {
    throw meetingsError(
      'FORBIDDEN',
      'Only the user who started an upload can finish it'
    );
  }
  return upload;
}

/**
 * Finishes a direct upload once the file has been PUT: checks the stored
 * file and makes the attachment visible. If it fails, the upload stays
 * pending so it can be retried or aborted.
 */
export async function completeAttachmentUpload(
  uploadId: string,
  userId: string,
  { sha256 }: { sha256?: string } = {}
): Promise<MeetingAttachmentDocument> {
  requireUserId(userId);
  const upload = await requirePendingUpload(uploadId, userId);
  if (upload.uploadExpiresAt && upload.uploadExpiresAt <= new Date()) {
    throw meetingsError('UPLOAD_INCOMPLETE', 'The upload has expired');
  }
  if (sha256 !== undefined && !SHA256_PATTERN.test(sha256)) {
    throw meetingsError(
      'BAD_USER_INPUT',
      'sha256 must be a hex SHA-256 digest'
    );
  }
  const meeting = await requireEditableMeeting(upload.meetingId);
  const workspace = await requireWorkspace(meeting.workspaceId);

  const info = await getFileInfo(upload.fileKey);
  if (!info) {
    throw meetingsError(
      'UPLOAD_INCOMPLETE',
      'The file has not been uploaded yet'
    );
  }
  if (info.size !== upload.size) {
    throw meetingsError(
      'UPLOAD_INCOMPLETE',
      `The uploaded file is ${info.size} bytes, not the ${upload.size} declared`
    );
  }
  validateFile(workspace, info.size, upload.mimeType);

  const completed = await MeetingAttachments.updateAsync(
    { _id: upload._id, status: MeetingAttachmentStatus.PENDING },
    {
      $set: {
        status: MeetingAttachmentStatus.READY,
        ...(sha256 ? { sha256: sha256.toLowerCase() } : {}),
        ...(info.etag ? { etag: info.etag } : {}),
        updatedAt: new Date(),
        updatedBy: userId,
      },
      $unset: { uploadExpiresAt: 1 },
    }
  );
  if (!completed) {
    throw meetingsError(
      'CONFLICT',
      'The upload was already completed or aborted'
    );
  }
  await changeAttachmentCount(meeting._id, 1);
  await logAttachmentAdded(meeting, upload, userId);
  return requireAttachment(upload._id);
}

/** Cancels a pending upload and removes anything already uploaded. */
export async function abortAttachmentUpload(
  uploadId: string,
  userId: string
): Promise<void> {
  requireUserId(userId);
  const upload = await requirePendingUpload(uploadId, userId);
  await MeetingAttachments.removeAsync({
    _id: upload._id,
    status: MeetingAttachmentStatus.PENDING,
  });
  await deleteFilesQuietly([upload.fileKey]);
}

/**
 * Removes pending uploads whose URL has expired, with any files already
 * uploaded. Maintenance only - meant for a job or an admin action.
 * Returns how many were removed.
 */
export async function purgeExpiredAttachmentUploads(): Promise<number> {
  const expired = await MeetingAttachments.find(
    {
      status: MeetingAttachmentStatus.PENDING,
      uploadExpiresAt: { $lte: new Date() },
    },
    { fields: { _id: 1, fileKey: 1 } }
  ).fetchAsync();
  if (!expired.length) return 0;

  await MeetingAttachments.removeAsync({
    _id: { $in: expired.map(({ _id }) => _id) },
    status: MeetingAttachmentStatus.PENDING,
  });
  await deleteFilesQuietly(expired.map(({ fileKey }) => fileKey));
  return expired.length;
}

/** A meeting's attachments, oldest first. */
export async function listAttachments(
  meetingId: string,
  userId: string
): Promise<MeetingAttachmentDocument[]> {
  requireUserId(userId);
  await requireMeeting(meetingId);
  return MeetingAttachments.find(
    { meetingId, status: MeetingAttachmentStatus.READY },
    { sort: { createdAt: 1, _id: 1 } }
  ).fetchAsync();
}

export async function getAttachment(
  attachmentId: string,
  userId: string
): Promise<MeetingAttachmentDocument> {
  requireUserId(userId);
  return requireAttachment(attachmentId);
}

export interface UpdateAttachmentInput {
  name?: string;
  /** null clears it. */
  description?: string | null;
}

export async function updateAttachment(
  attachmentId: string,
  changes: UpdateAttachmentInput,
  userId: string
): Promise<MeetingAttachmentDocument> {
  requireUserId(userId);
  const attachment = await requireAttachment(attachmentId);
  await requireEditableMeeting(attachment.meetingId);

  const $set: Record<string, unknown> = {
    updatedAt: new Date(),
    updatedBy: userId,
  };
  const $unset: Record<string, 1> = {};
  if (changes.name !== undefined) {
    $set.name = normalizeTitle(changes.name, 'Attachment name');
  }
  if (changes.description !== undefined) {
    const description = normalizeText(changes.description, 'Description');
    if (description) $set.description = description;
    else $unset.description = 1;
  }

  await MeetingAttachments.updateAsync(attachmentId, {
    $set,
    ...(Object.keys($unset).length ? { $unset } : {}),
  });
  await logActivity({
    workspaceId: attachment.workspaceId,
    meetingId: attachment.meetingId,
    entityType: MeetingsEntityType.ATTACHMENT,
    entityId: attachmentId,
    action: MeetingsAction.ATTACHMENT_UPDATED,
    userId,
    details: { changed: Object.keys(changes) },
  });
  return requireAttachment(attachmentId);
}

const logDownload = (attachment: MeetingAttachmentDocument, userId: string) =>
  logActivity({
    workspaceId: attachment.workspaceId,
    meetingId: attachment.meetingId,
    entityType: MeetingsEntityType.ATTACHMENT,
    entityId: attachment._id,
    action: MeetingsAction.ATTACHMENT_DOWNLOADED,
    userId,
  });

export interface AttachmentDownload {
  url: string;
  expiresAt: Date;
  fileName: string;
  mimeType: string;
  size: number;
}

/**
 * A presigned GET URL that saves the file under its original name, or
 * displays it in the browser with `inline: true`. Logged as a download.
 */
export async function getAttachmentDownloadUrl(
  attachmentId: string,
  userId: string,
  {
    inline = false,
    expiresInSec = MEETINGS_DOWNLOAD_URL_EXPIRY_SECONDS,
  }: { inline?: boolean; expiresInSec?: number } = {}
): Promise<AttachmentDownload> {
  requireUserId(userId);
  if (!Number.isSafeInteger(expiresInSec) || expiresInSec < 1) {
    throw meetingsError(
      'BAD_USER_INPUT',
      'expiresInSec must be a positive integer'
    );
  }
  const attachment = await requireAttachment(attachmentId);
  const url = await getFileUrl(attachment.fileKey, expiresInSec, {
    downloadFileName: attachment.fileName,
    inline,
  });
  await logDownload(attachment, userId);
  return {
    url,
    expiresAt: new Date(Date.now() + expiresInSec * 1000),
    fileName: attachment.fileName,
    mimeType: attachment.mimeType,
    size: attachment.size,
  };
}

/**
 * Reads an attachment's bytes on the server (loads the whole file into
 * memory). Logged as a download.
 */
export async function readAttachmentContent(
  attachmentId: string,
  userId: string
): Promise<{ body: Buffer; fileName: string; mimeType: string }> {
  requireUserId(userId);
  const attachment = await requireAttachment(attachmentId);
  const { body } = await getFile(attachment.fileKey);
  await logDownload(attachment, userId);
  return { body, fileName: attachment.fileName, mimeType: attachment.mimeType };
}

/** Permanently deletes an attachment and its stored file. */
export async function deleteAttachment(
  attachmentId: string,
  userId: string
): Promise<void> {
  requireUserId(userId);
  const attachment = await requireAttachment(attachmentId);
  await requireEditableMeeting(attachment.meetingId);

  const removed = await MeetingAttachments.removeAsync({
    _id: attachmentId,
    status: MeetingAttachmentStatus.READY,
  });
  if (!removed) return;
  await changeAttachmentCount(attachment.meetingId, -1);
  await logActivity({
    workspaceId: attachment.workspaceId,
    meetingId: attachment.meetingId,
    entityType: MeetingsEntityType.ATTACHMENT,
    entityId: attachmentId,
    action: MeetingsAction.ATTACHMENT_DELETED,
    userId,
    details: { name: attachment.name },
  });
  await deleteFilesQuietly([attachment.fileKey]);
}
