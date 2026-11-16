import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  DmsActivities,
  DmsDocuments,
  DmsDocumentVersions,
  DmsFolders,
} from 'meteor/idreesia-common/server/collections/dms';
import * as storage from 'meteor/idreesia-common/server/test-utils/file-storage-mock';

import { uploadDocument } from './documents';
import { checkOutDocument } from './locking';
import { trashDocument } from './trash';
import {
  abortUpload,
  completeUpload,
  createUploadUrl,
  purgeExpiredUploads,
} from './uploads';
import {
  deleteVersion,
  listVersions,
  restoreVersion,
  uploadNewVersion,
} from './versions';
import { createFolder } from './folders';
import { createTestWorkspace } from './test-helpers';
import { updateWorkspace } from './workspaces';

vi.mock('meteor/idreesia-common/server/file-storage', async () =>
  import('meteor/idreesia-common/server/test-utils/file-storage-mock')
);

let workspaceId: string;

// The unique-name indexes are created by migration 60, not by the collections.
const createNameIndexes = async () => {
  await DmsFolders.rawCollection().createIndex(
    { workspaceId: 1, parentId: 1, nameLower: 1 },
    { unique: true, partialFilterExpression: { trashed: false } }
  );
  await DmsDocuments.rawCollection().createIndex(
    { workspaceId: 1, folderId: 1, nameLower: 1 },
    { unique: true, partialFilterExpression: { trashed: false } }
  );
};

beforeEach(async () => {
  vi.clearAllMocks();
  storage.fileInfo.size = 5;
  await createNameIndexes();
  workspaceId = await createTestWorkspace();
});

afterEach(() => {
  vi.restoreAllMocks();
});

const rejectsWith = async (promise: Promise<unknown>, code: string) => {
  await expect(promise).rejects.toMatchObject({ extensions: { code } });
};

const newDoc = async (name = 'report') =>
  (
    await uploadDocument(
      {
        workspaceId,
        name,
        fileName: `${name}.txt`,
        body: Buffer.from('hello'),
        mimeType: 'text/plain',
      },
      'u1'
    )
  ).document;

const v = (text = 'v2', extra: Record<string, unknown> = {}) => ({
  body: Buffer.from(text),
  mimeType: 'text/plain',
  ...extra,
});

const actions = async () =>
  (await DmsActivities.find({}, { sort: { at: 1 } }).fetchAsync()).map((a: any) => a.action);

describe('versions', () => {
  it('numbers versions sequentially and makes the newest current', async () => {
    const d = await newDoc();
    const v2 = await uploadNewVersion(d._id, v('two', { comment: ' fix ' }), 'u2');
    expect(v2).toMatchObject({ versionNumber: 2, comment: 'fix', createdBy: 'u2', size: 3 });
    const doc = (await DmsDocuments.findOneAsync(d._id))!;
    expect(doc).toMatchObject({ currentVersionId: v2._id, currentVersionNumber: 2, versionCount: 2 });
    expect((await listVersions(d._id, 'u1')).map(x => x.versionNumber)).toEqual([2, 1]);
    expect(await actions()).toContain('version-added');
  });

  it('rejects non-buffers, bad mime types and files over the workspace limit', async () => {
    const d = await newDoc();
    await rejectsWith(uploadNewVersion(d._id, v('x', { body: 'text' }), 'u1'), 'BAD_USER_INPUT');
    await rejectsWith(uploadNewVersion(d._id, v('x', { mimeType: '??' }), 'u1'), 'BAD_USER_INPUT');
    await updateWorkspace(workspaceId, { settings: { maxFileSize: 2 } } as any, 'u1');
    await rejectsWith(uploadNewVersion(d._id, v('toolong'), 'u1'), 'TOO_LARGE');
    expect((await DmsDocuments.findOneAsync(d._id))?.versionCount).toBe(1);
  });

  it("can't add a version while someone else has the document checked out, but the holder can", async () => {
    const d = await newDoc();
    await checkOutDocument(d._id, 'u2');
    await rejectsWith(uploadNewVersion(d._id, v(), 'u1'), 'LOCKED');
    await expect(uploadNewVersion(d._id, v(), 'u2')).resolves.toBeDefined();
  });

  it("can't add a version to a trashed or missing document", async () => {
    const d = await newDoc();
    await trashDocument(d._id, 'u1');
    await rejectsWith(uploadNewVersion(d._id, v(), 'u1'), 'NOT_FOUND');
    await rejectsWith(uploadNewVersion('nope', v(), 'u1'), 'NOT_FOUND');
  });

  it('still lists the versions of a trashed document', async () => {
    const d = await newDoc();
    await trashDocument(d._id, 'u1');
    expect(await listVersions(d._id, 'u1')).toHaveLength(1);
  });

  it('restores an old version as a new one, copying the file', async () => {
    const d = await newDoc();
    const [first] = await listVersions(d._id, 'u1');
    await uploadNewVersion(d._id, v('two'), 'u1');
    const restored = await restoreVersion(d._id, first._id, 'u2');
    expect(restored).toMatchObject({
      versionNumber: 3,
      restoredFromVersionId: first._id,
      comment: 'Restored from version 1',
    });
    expect(restored.fileKey).not.toBe(first.fileKey);
    expect(storage.copyFile).toHaveBeenCalledWith(first.fileKey, restored.fileKey);
    expect((await DmsDocuments.findOneAsync(d._id))?.currentVersionId).toBe(restored._id);
    expect(await actions()).toContain('version-restored');
  });

  it('rejects restoring a version of another document or a missing one, and respects locks', async () => {
    const d1 = await newDoc('one');
    const d2 = await newDoc('two');
    const [other] = await listVersions(d2._id, 'u1');
    await rejectsWith(restoreVersion(d1._id, other._id, 'u1'), 'NOT_FOUND');
    await rejectsWith(restoreVersion(d1._id, 'nope', 'u1'), 'NOT_FOUND');
    const [own] = await listVersions(d1._id, 'u1');
    await checkOutDocument(d1._id, 'u2');
    await rejectsWith(restoreVersion(d1._id, own._id, 'u1'), 'LOCKED');
  });

  it('removes the copied file when a restore cannot be logged', async () => {
    const d = await newDoc();
    const [first] = await listVersions(d._id, 'u1');
    vi.spyOn(DmsActivities, 'insertAsync').mockRejectedValueOnce(new Error('log failed'));
    await expect(restoreVersion(d._id, first._id, 'u1')).rejects.toThrow('log failed');
    expect(await DmsDocumentVersions.find({}).countAsync()).toBe(1);
    expect((await DmsDocuments.findOneAsync(d._id))?.versionCount).toBe(1);
    const [copiedKey] = storage.copyFile.mock.calls[0].slice(1) as unknown as string[];
    expect(storage.deleteFiles).toHaveBeenCalledWith([copiedKey]);
  });

  it('deletes an older version and its file, but never the current one', async () => {
    const d = await newDoc();
    const [first] = await listVersions(d._id, 'u1');
    const second = await uploadNewVersion(d._id, v(), 'u1');
    await rejectsWith(deleteVersion(d._id, second._id, 'u1'), 'CONFLICT');
    storage.deleteFiles.mockClear();
    await deleteVersion(d._id, first._id, 'u1');
    expect(await DmsDocumentVersions.findOneAsync(first._id)).toBeUndefined();
    expect(storage.deleteFiles).toHaveBeenCalledWith([first.fileKey]);
    await rejectsWith(deleteVersion(d._id, first._id, 'u1'), 'NOT_FOUND');
    expect(await actions()).toContain('version-deleted');
  });

  it("can't delete a version while someone else holds the lock", async () => {
    const d = await newDoc();
    const [first] = await listVersions(d._id, 'u1');
    await uploadNewVersion(d._id, v(), 'u1');
    await checkOutDocument(d._id, 'u2');
    await rejectsWith(deleteVersion(d._id, first._id, 'u1'), 'LOCKED');
    expect(await DmsDocumentVersions.findOneAsync(first._id)).toBeDefined();
  });
});

describe('direct uploads', () => {
  const ticketFor = (extra: Record<string, unknown> = {}) =>
    createUploadUrl(
      { workspaceId, fileName: 'big.pdf', mimeType: 'application/pdf', size: 5, ...extra },
      'u1'
    );

  it('creates a pending version that creates no document until completed', async () => {
    const ticket = await ticketFor();
    expect(ticket).toMatchObject({ method: 'PUT', headers: { 'Content-Type': 'application/pdf' } });
    expect(await DmsDocuments.find({}).countAsync()).toBe(0);
    const pending = (await DmsDocumentVersions.findOneAsync(ticket.uploadId))!;
    expect(pending.status).toBe('pending');
  });

  it('completes a new-document upload: creates the document and version, logs creation', async () => {
    const ticket = await ticketFor({ name: 'Plan', tags: ['x'], comment: 'first' });
    const { document, version } = await completeUpload(ticket.uploadId, 'u1', {
      sha256: 'B'.repeat(64),
    });
    expect(document).toMatchObject({ _id: ticket.documentId, name: 'Plan', versionCount: 1 });
    expect(version).toMatchObject({ versionNumber: 1, status: 'ready', sha256: 'b'.repeat(64), comment: 'first' });
    expect(version.uploadExpiresAt).toBeUndefined();
    expect(await actions()).toContain('document-created');
  });

  it('completes a new-version upload to an existing document', async () => {
    const d = await newDoc();
    const ticket = await ticketFor({ documentId: d._id });
    expect(ticket.documentId).toBe(d._id);
    const { version } = await completeUpload(ticket.uploadId, 'u1');
    expect(version.versionNumber).toBe(2);
    expect(await actions()).toContain('version-added');
  });

  it('refuses a new-version upload to a document locked by someone else', async () => {
    const d = await newDoc();
    await checkOutDocument(d._id, 'u2');
    await rejectsWith(ticketFor({ documentId: d._id }), 'LOCKED');
  });

  it('refuses a new document whose name is taken in that folder', async () => {
    await newDoc('taken');
    await rejectsWith(ticketFor({ name: 'taken' }), 'CONFLICT');
    const folder = await createFolder({ workspaceId, name: 'F' }, 'u1');
    await expect(ticketFor({ name: 'taken', folderId: folder._id })).resolves.toBeDefined();
  });

  it('fails the completion when the name was taken in the meantime, leaving no document', async () => {
    const ticket = await ticketFor({ name: 'race' });
    await newDoc('race');
    await expect(completeUpload(ticket.uploadId, 'u1')).rejects.toMatchObject({
      extensions: { code: 'CONFLICT' },
    });
    expect(await DmsDocuments.find({}).countAsync()).toBe(1);
    expect((await DmsDocumentVersions.findOneAsync(ticket.uploadId))?.status).toBe('pending');
  });

  it('only lets the starter complete or abort', async () => {
    const ticket = await ticketFor();
    await rejectsWith(completeUpload(ticket.uploadId, 'u2'), 'FORBIDDEN');
    await rejectsWith(abortUpload(ticket.uploadId, 'u2'), 'FORBIDDEN');
  });

  it('refuses incomplete uploads: missing, wrong size, bad hash, expired', async () => {
    const ticket = await ticketFor();
    storage.getFileInfo.mockResolvedValueOnce(undefined as any);
    await rejectsWith(completeUpload(ticket.uploadId, 'u1'), 'UPLOAD_INCOMPLETE');
    storage.fileInfo.size = 9;
    await rejectsWith(completeUpload(ticket.uploadId, 'u1'), 'UPLOAD_INCOMPLETE');
    storage.fileInfo.size = 5;
    await rejectsWith(completeUpload(ticket.uploadId, 'u1', { sha256: 'nope' }), 'BAD_USER_INPUT');
    await DmsDocumentVersions.updateAsync(ticket.uploadId, {
      $set: { uploadExpiresAt: new Date(Date.now() - 1000) },
    });
    await rejectsWith(completeUpload(ticket.uploadId, 'u1'), 'UPLOAD_INCOMPLETE');
    expect(await DmsDocuments.find({}).countAsync()).toBe(0);
  });

  it('rolls back the new document when completion cannot be logged', async () => {
    const ticket = await ticketFor();
    vi.spyOn(DmsActivities, 'insertAsync').mockRejectedValueOnce(new Error('log failed'));
    await expect(completeUpload(ticket.uploadId, 'u1')).rejects.toThrow('log failed');
    expect(await DmsDocuments.find({}).countAsync()).toBe(0);
    expect((await DmsDocumentVersions.findOneAsync(ticket.uploadId))?.status).toBe('pending');
  });

  it('validates declared size and type; abort removes the pending upload and file', async () => {
    await rejectsWith(ticketFor({ size: -1 }), 'BAD_USER_INPUT');
    await rejectsWith(ticketFor({ mimeType: '' }), 'BAD_USER_INPUT');
    const ticket = await ticketFor();
    storage.deleteFiles.mockClear();
    await abortUpload(ticket.uploadId, 'u1');
    expect(await DmsDocumentVersions.find({}).countAsync()).toBe(0);
    expect(storage.deleteFiles).toHaveBeenCalled();
    await rejectsWith(abortUpload(ticket.uploadId, 'u1'), 'NOT_FOUND');
    await rejectsWith(completeUpload(ticket.uploadId, 'u1'), 'NOT_FOUND');
  });

  it('purges only expired pending uploads', async () => {
    const stale = await ticketFor();
    const fresh = await ticketFor();
    await newDoc();
    await DmsDocumentVersions.updateAsync(stale.uploadId, {
      $set: { uploadExpiresAt: new Date(Date.now() - 1000) },
    });
    expect(await purgeExpiredUploads()).toBe(1);
    expect(await DmsDocumentVersions.findOneAsync(stale.uploadId)).toBeUndefined();
    expect(await DmsDocumentVersions.findOneAsync(fresh.uploadId)).toBeDefined();
    expect(await DmsDocumentVersions.find({ status: 'ready' }).countAsync()).toBe(1);
    expect(await purgeExpiredUploads()).toBe(0);
  });
});
