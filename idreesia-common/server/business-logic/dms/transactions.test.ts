import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  DmsActivities,
  DmsDocuments,
  DmsDocumentVersions,
} from 'meteor/idreesia-common/server/collections/dms';
import * as storage from 'meteor/idreesia-common/server/test-utils/file-storage-mock';

import { uploadDocument } from './documents';
import { trashDocument } from './trash';
import { deleteVersion, uploadNewVersion } from './versions';
import { createTestDocument, createTestWorkspace } from './test-helpers';

vi.mock('meteor/idreesia-common/server/file-storage', async () =>
  import('meteor/idreesia-common/server/test-utils/file-storage-mock')
);

// Each operation runs in one transaction. When a later write fails, none of
// its earlier writes remain, a file stored for it is removed, and a file of
// a record it deleted is kept.

let workspaceId: string;

beforeEach(async () => {
  workspaceId = await createTestWorkspace();
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

const failActivityLog = () =>
  vi
    .spyOn(DmsActivities, 'insertAsync')
    .mockRejectedValueOnce(new Error('activity log failed'));

describe('dms transactions', () => {
  it('rolls back a new document and its version, and removes the stored file', async () => {
    failActivityLog();
    await expect(
      uploadDocument(
        {
          workspaceId,
          fileName: 'report.pdf',
          body: Buffer.from('file'),
          mimeType: 'application/pdf',
        },
        'u1'
      )
    ).rejects.toThrow('activity log failed');

    expect(await DmsDocuments.find({}).countAsync()).toBe(0);
    expect(await DmsDocumentVersions.find({}).countAsync()).toBe(0);
    expect(storage.putFile).toHaveBeenCalledOnce();
    const [storedKey] = (storage.putFile.mock.calls[0] as unknown as [string]);
    expect(storage.deleteFiles).toHaveBeenCalledWith([storedKey]);
  });

  it('keeps the version count and current version when a new version fails', async () => {
    const document = await createTestDocument(workspaceId);

    failActivityLog();
    await expect(
      uploadNewVersion(
        document._id,
        { body: Buffer.from('v1'), mimeType: 'application/pdf' },
        'u1'
      )
    ).rejects.toThrow();

    const after = await DmsDocuments.findOneAsync(document._id);
    expect(after?.versionCount).toBe(0);
    expect(after?.currentVersionId).toBeUndefined();
    expect(await DmsDocumentVersions.find({}).countAsync()).toBe(0);
  });

  it('keeps a deleted version and its file when the deletion fails', async () => {
    const document = await createTestDocument(workspaceId);
    const first = await uploadNewVersion(
      document._id,
      { body: Buffer.from('v1'), mimeType: 'application/pdf' },
      'u1'
    );
    await uploadNewVersion(
      document._id,
      { body: Buffer.from('v2'), mimeType: 'application/pdf' },
      'u1'
    );
    vi.clearAllMocks();

    failActivityLog();
    await expect(deleteVersion(document._id, first._id, 'u1')).rejects.toThrow();

    expect(await DmsDocumentVersions.findOneAsync(first._id)).toBeDefined();
    expect(storage.deleteFiles).not.toHaveBeenCalled();
  });

  it('leaves a document out of the trash when trashing it fails', async () => {
    const document = await createTestDocument(workspaceId);

    failActivityLog();
    await expect(trashDocument(document._id, 'u1')).rejects.toThrow();

    expect((await DmsDocuments.findOneAsync(document._id))?.trashed).toBe(false);
  });
});
