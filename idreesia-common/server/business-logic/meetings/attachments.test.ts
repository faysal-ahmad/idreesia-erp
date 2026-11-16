import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  MeetingAttachments,
  Meetings,
  MeetingsActivities,
} from 'meteor/idreesia-common/server/collections/meetings';
import * as storage from 'meteor/idreesia-common/server/test-utils/file-storage-mock';

import {
  abortAttachmentUpload,
  cancelMeeting,
  completeAttachmentUpload,
  createAttachmentUploadUrl,
  createMeeting,
  createMeetingsWorkspace,
  deleteAttachment,
  deleteMeeting,
  getAttachment,
  getAttachmentDownloadUrl,
  listAttachments,
  purgeExpiredAttachmentUploads,
  readAttachmentContent,
  updateAttachment,
  uploadAttachment,
} from './index';

vi.mock('meteor/idreesia-common/server/file-storage', async () =>
  import('meteor/idreesia-common/server/test-utils/file-storage-mock')
);

const HOUR = 60 * 60 * 1000;
let workspaceId: string;
let meetingId: string;

const makeWorkspace = async (settings?: Record<string, unknown>) => {
  workspaceId = (await createMeetingsWorkspace({ name: 'W', ...(settings ? { settings } : {}) } as any, 'u1'))._id;
  const start = new Date(Date.now() + 24 * HOUR);
  meetingId = (
    await createMeeting(
      { workspaceId, title: 'M', startsAt: start, endsAt: new Date(start.getTime() + HOUR) },
      'u1'
    )
  )._id;
};

beforeEach(async () => {
  vi.clearAllMocks();
  storage.fileInfo.size = 5;
  await makeWorkspace();
});

afterEach(() => {
  vi.restoreAllMocks();
});

const rejectsWith = async (promise: Promise<unknown>, code: string) => {
  await expect(promise).rejects.toMatchObject({ extensions: { code } });
};

const upload = (extra: Record<string, unknown> = {}) =>
  uploadAttachment(
    { meetingId, fileName: 'a.txt', body: Buffer.from('hello'), mimeType: 'text/plain', ...extra },
    'u1'
  );

const actions = async () =>
  (await MeetingsActivities.find({ meetingId }, { sort: { at: 1 } }).fetchAsync()).map(
    (a: any) => a.action
  );

describe('uploadAttachment', () => {
  it('stores the file, records size and hash, bumps the count and logs it', async () => {
    const attachment = await upload({ name: 'Agenda', description: ' d ' });
    expect(attachment).toMatchObject({
      name: 'Agenda',
      description: 'd',
      size: 5,
      status: 'ready',
      mimeType: 'text/plain',
      createdBy: 'u1',
    });
    expect(attachment.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(storage.putFile).toHaveBeenCalledTimes(1);
    expect((await Meetings.findOneAsync(meetingId))?.attachmentCount).toBe(1);
    expect(await actions()).toContain('attachment-added');
  });

  it('removes the stored file and the row when the activity entry cannot be written', async () => {
    vi.spyOn(MeetingsActivities, 'insertAsync').mockRejectedValueOnce(new Error('log failed'));
    await expect(upload()).rejects.toThrow('log failed');
    expect(await MeetingAttachments.find({}).countAsync()).toBe(0);
    expect((await Meetings.findOneAsync(meetingId))?.attachmentCount ?? 0).toBe(0);
    expect(storage.deleteFiles.mock.calls.length + storage.deleteFile.mock.calls.length).toBeGreaterThan(0);
  });

  it('enforces size and type limits of the workspace', async () => {
    await makeWorkspace({ maxFileSize: 3, allowedMimeTypes: ['text/*'] });
    await rejectsWith(upload(), 'TOO_LARGE');
    await makeWorkspace({ allowedMimeTypes: ['image/*', 'application/pdf'] });
    await rejectsWith(upload(), 'BAD_USER_INPUT');
    await expect(upload({ mimeType: 'application/pdf' })).resolves.toBeDefined();
  });

  it('rejects non-buffers, path-like names and bad mime types', async () => {
    await rejectsWith(upload({ body: 'text' }), 'BAD_USER_INPUT');
    await rejectsWith(upload({ fileName: '../x.txt' }), 'BAD_USER_INPUT');
    await rejectsWith(upload({ mimeType: 'nonsense' }), 'BAD_USER_INPUT');
  });

  it('refuses uploads to a cancelled meeting', async () => {
    await cancelMeeting(meetingId, 'u1');
    await rejectsWith(upload(), 'CONFLICT');
  });
});

describe('direct uploads', () => {
  const start = (extra: Record<string, unknown> = {}) =>
    createAttachmentUploadUrl(
      { meetingId, fileName: 'big.pdf', mimeType: 'application/pdf', size: 5, ...extra },
      'u1'
    );

  it('creates a pending upload that is not listed or readable until completed', async () => {
    const ticket = await start();
    expect(ticket).toMatchObject({ method: 'PUT', headers: { 'Content-Type': 'application/pdf' } });
    expect(await listAttachments(meetingId, 'u1')).toHaveLength(0);
    await rejectsWith(getAttachment(ticket.attachmentId, 'u1'), 'NOT_FOUND');
    expect((await Meetings.findOneAsync(meetingId))?.attachmentCount ?? 0).toBe(0);
  });

  it('completes: marks ready, counts it once, logs it', async () => {
    const ticket = await start();
    const done = await completeAttachmentUpload(ticket.uploadId, 'u1', { sha256: 'A'.repeat(64) });
    expect(done.status).toBe('ready');
    expect(done.sha256).toBe('a'.repeat(64));
    expect(done.uploadExpiresAt).toBeUndefined();
    expect((await Meetings.findOneAsync(meetingId))?.attachmentCount).toBe(1);
    expect(await actions()).toContain('attachment-added');
    await rejectsWith(completeAttachmentUpload(ticket.uploadId, 'u1'), 'NOT_FOUND');
  });

  it('only lets the user who started an upload finish or abort it', async () => {
    const ticket = await start();
    await rejectsWith(completeAttachmentUpload(ticket.uploadId, 'u2'), 'FORBIDDEN');
    await rejectsWith(abortAttachmentUpload(ticket.uploadId, 'u2'), 'FORBIDDEN');
  });

  it('refuses an incomplete upload: missing file, wrong size, expired, bad hash', async () => {
    const ticket = await start();
    storage.getFileInfo.mockResolvedValueOnce(undefined as any);
    await rejectsWith(completeAttachmentUpload(ticket.uploadId, 'u1'), 'UPLOAD_INCOMPLETE');
    storage.fileInfo.size = 6;
    await rejectsWith(completeAttachmentUpload(ticket.uploadId, 'u1'), 'UPLOAD_INCOMPLETE');
    storage.fileInfo.size = 5;
    await rejectsWith(
      completeAttachmentUpload(ticket.uploadId, 'u1', { sha256: 'xyz' }),
      'BAD_USER_INPUT'
    );
    await MeetingAttachments.updateAsync(ticket.uploadId, {
      $set: { uploadExpiresAt: new Date(Date.now() - 1000) },
    });
    await rejectsWith(completeAttachmentUpload(ticket.uploadId, 'u1'), 'UPLOAD_INCOMPLETE');
    expect((await Meetings.findOneAsync(meetingId))?.attachmentCount ?? 0).toBe(0);
  });

  it('aborts: removes the pending row and deletes the stored file', async () => {
    const ticket = await start();
    await abortAttachmentUpload(ticket.uploadId, 'u1');
    expect(await MeetingAttachments.find({}).countAsync()).toBe(0);
    expect(storage.deleteFiles.mock.calls.length + storage.deleteFile.mock.calls.length).toBeGreaterThan(0);
    await rejectsWith(abortAttachmentUpload(ticket.uploadId, 'u1'), 'NOT_FOUND');
  });

  it('validates the declared size and mime type up front', async () => {
    await rejectsWith(start({ size: -1 }), 'BAD_USER_INPUT');
    await rejectsWith(start({ size: 1.5 }), 'BAD_USER_INPUT');
    await rejectsWith(start({ mimeType: '' }), 'BAD_USER_INPUT');
  });

  it('purges only expired pending uploads', async () => {
    const fresh = await start();
    const stale = await start();
    await MeetingAttachments.updateAsync(stale.uploadId, {
      $set: { uploadExpiresAt: new Date(Date.now() - 1000) },
    });
    await upload();
    expect(await purgeExpiredAttachmentUploads()).toBe(1);
    expect(await MeetingAttachments.findOneAsync(stale.uploadId)).toBeUndefined();
    expect(await MeetingAttachments.findOneAsync(fresh.uploadId)).toBeDefined();
    expect(await MeetingAttachments.find({ status: 'ready' }).countAsync()).toBe(1);
    expect(await purgeExpiredAttachmentUploads()).toBe(0);
  });
});

describe('managing attachments', () => {
  it('updates name and description and logs the change', async () => {
    const attachment = await upload({ description: 'd' });
    const updated = await updateAttachment(attachment._id, { name: 'New', description: null }, 'u2');
    expect(updated).toMatchObject({ name: 'New', updatedBy: 'u2' });
    expect(updated.description).toBeUndefined();
    await rejectsWith(updateAttachment(attachment._id, { name: ' ' }, 'u1'), 'BAD_USER_INPUT');
    expect(await actions()).toContain('attachment-updated');
  });

  it('deletes: count goes down, file deleted after commit, activity kept', async () => {
    const attachment = await upload();
    storage.deleteFiles.mockClear();
    storage.deleteFile.mockClear();
    await deleteAttachment(attachment._id, 'u1');
    expect((await Meetings.findOneAsync(meetingId))?.attachmentCount).toBe(0);
    expect(storage.deleteFiles.mock.calls.length + storage.deleteFile.mock.calls.length).toBeGreaterThan(0);
    expect(await actions()).toContain('attachment-deleted');
    await rejectsWith(deleteAttachment(attachment._id, 'u1'), 'NOT_FOUND');
  });

  it('does not delete the stored file when the deletion is rolled back', async () => {
    const attachment = await upload();
    storage.deleteFiles.mockClear();
    storage.deleteFile.mockClear();
    vi.spyOn(MeetingsActivities, 'insertAsync').mockRejectedValueOnce(new Error('log failed'));
    await expect(deleteAttachment(attachment._id, 'u1')).rejects.toThrow('log failed');
    expect(await MeetingAttachments.findOneAsync(attachment._id)).toBeDefined();
    expect((await Meetings.findOneAsync(meetingId))?.attachmentCount).toBe(1);
    expect(storage.deleteFiles).not.toHaveBeenCalled();
    expect(storage.deleteFile).not.toHaveBeenCalled();
  });

  it('cannot change attachments of a cancelled meeting but can still read them', async () => {
    const attachment = await upload();
    await cancelMeeting(meetingId, 'u1');
    await rejectsWith(updateAttachment(attachment._id, { name: 'x' }, 'u1'), 'CONFLICT');
    await rejectsWith(deleteAttachment(attachment._id, 'u1'), 'CONFLICT');
    expect(await listAttachments(meetingId, 'u1')).toHaveLength(1);
  });

  it('deleting the meeting removes its attachments and files', async () => {
    await upload();
    storage.deleteFiles.mockClear();
    storage.deleteFile.mockClear();
    await deleteMeeting(meetingId, 'u1');
    expect(await MeetingAttachments.find({}).countAsync()).toBe(0);
    expect(storage.deleteFiles.mock.calls.length + storage.deleteFile.mock.calls.length).toBeGreaterThan(0);
  });

  it('download url: logs a download, validates expiry', async () => {
    const attachment = await upload();
    const download = await getAttachmentDownloadUrl(attachment._id, 'u2', { expiresInSec: 60 });
    expect(download).toMatchObject({ fileName: 'a.txt', mimeType: 'text/plain', size: 5 });
    expect(download.url).toBe('https://storage.test/file');
    expect(await actions()).toContain('attachment-downloaded');
    await rejectsWith(getAttachmentDownloadUrl(attachment._id, 'u1', { expiresInSec: 0 }), 'BAD_USER_INPUT');
    await rejectsWith(getAttachmentDownloadUrl('nope', 'u1'), 'NOT_FOUND');
  });

  it('reads content and logs the download', async () => {
    const attachment = await upload();
    storage.getFile.mockResolvedValueOnce({ body: Buffer.from('file') } as any);
    const content = await readAttachmentContent(attachment._id, 'u1');
    expect(content.fileName).toBe('a.txt');
    expect(content.body.toString()).toBe('file');
    expect(await actions()).toContain('attachment-downloaded');
  });

  it('requires a user id on reads', async () => {
    const attachment = await upload();
    await rejectsWith(getAttachment(attachment._id, ''), 'BAD_USER_INPUT');
    await rejectsWith(listAttachments(meetingId, ''), 'BAD_USER_INPUT');
  });
});
