import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Notifications from 'meteor/idreesia-common/server/collections/common/notifications';
import * as storage from 'meteor/idreesia-common/server/test-utils/file-storage-mock';

import { copyDocument, uploadDocument } from './documents';
import { completeUpload, createUploadUrl } from './uploads';
import { restoreVersion, uploadNewVersion } from './versions';
import {
  committeeOf,
  createTestWorkspace,
  dmsNotification,
  dmsNotifications,
  HOUR,
  NOW,
} from './test-helpers';

vi.mock('meteor/idreesia-common/server/file-storage', async () =>
  import('meteor/idreesia-common/server/test-utils/file-storage-mock')
);

let workspaceId: string;

const file = (name = 'minutes.txt') => ({
  workspaceId,
  fileName: name,
  body: Buffer.from('hello'),
  mimeType: 'text/plain',
});

const kinds = async () => (await dmsNotifications()).map(n => n.eventType).sort();

beforeEach(async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(NOW);
  workspaceId = await createTestWorkspace();
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('creating a document', () => {
  it('tells the workspace about the new document, once, and not about a new version', async () => {
    const { document } = await uploadDocument(file(), 'u1');

    expect(await kinds()).toEqual(['document-created']);
    expect(await dmsNotification(`document-added:${document._id}`)).toMatchObject({
      committeeId: committeeOf(workspaceId),
      entityId: document._id,
      actorUserId: 'u1',
    });
  });

  it('succeeds even when the notification cannot be stored', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(Notifications, 'insertAsync').mockRejectedValue(new Error('down'));

    const { document, version } = await uploadDocument(file(), 'u1');

    expect(document.name).toBe('minutes.txt');
    expect(version.versionNumber).toBe(1);
  });
});

describe('adding a version', () => {
  it('tells the workspace, and updates one notification as more versions arrive', async () => {
    const { document } = await uploadDocument(file(), 'u1');

    await uploadNewVersion(document._id, { body: Buffer.from('v2'), mimeType: 'text/plain' }, 'u1');
    expect(await dmsNotification(`version-added:${document._id}`)).toMatchObject({
      data: { versionNumber: 2 },
      actorUserId: 'u1',
    });

    vi.setSystemTime(new Date(NOW.getTime() + HOUR));
    await uploadNewVersion(document._id, { body: Buffer.from('v3'), mimeType: 'text/plain' }, 'u2');

    const versionNotifications = (await dmsNotifications()).filter(
      n => n.eventType === 'version-added'
    );
    expect(versionNotifications).toHaveLength(1);
    expect(versionNotifications[0]).toMatchObject({
      data: { versionNumber: 3 },
      actorUserId: 'u2',
    });
  });

  it('tells the workspace when an old version is restored as the newest', async () => {
    const { document, version } = await uploadDocument(file(), 'u1');
    await uploadNewVersion(document._id, { body: Buffer.from('v2'), mimeType: 'text/plain' }, 'u1');

    await restoreVersion(document._id, version._id, 'u1');

    expect(await dmsNotification(`version-added:${document._id}`)).toMatchObject({
      data: { versionNumber: 3 },
    });
  });

  it('succeeds even when the notification cannot be stored', async () => {
    const { document } = await uploadDocument(file(), 'u1');
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(Notifications, 'insertAsync').mockRejectedValue(new Error('down'));

    const version = await uploadNewVersion(
      document._id,
      { body: Buffer.from('v2'), mimeType: 'text/plain' },
      'u1'
    );

    expect(version.versionNumber).toBe(2);
  });
});

describe('copying a document', () => {
  it('tells the workspace about the copy', async () => {
    const { document } = await uploadDocument(file(), 'u1');

    const { document: copy } = await copyDocument(document._id, 'u2');

    expect(await dmsNotification(`document-added:${copy._id}`)).toMatchObject({
      committeeId: committeeOf(workspaceId),
      actorUserId: 'u2',
    });
    expect(await dmsNotification(`version-added:${copy._id}`)).toBeUndefined();
  });
});

describe('direct uploads', () => {
  const start = (input: Record<string, unknown>, userId = 'u1') =>
    createUploadUrl(
      { workspaceId, fileName: 'plan.txt', mimeType: 'text/plain', size: 5, ...input },
      userId
    );

  beforeEach(() => {
    storage.getFileInfo.mockResolvedValue({ size: 5, etag: 'etag' });
  });

  it('completing the upload of a new document tells the workspace about the document only', async () => {
    const ticket = await start({});

    const { document } = await completeUpload(ticket.uploadId, 'u1');

    expect(await kinds()).toEqual(['document-created']);
    expect(await dmsNotification(`document-added:${document._id}`)).toBeDefined();
  });

  it('completing the upload of a new version tells the workspace about the version', async () => {
    const { document } = await uploadDocument(file(), 'u1');
    await Notifications.removeAsync({});
    const ticket = await start({ documentId: document._id });

    await completeUpload(ticket.uploadId, 'u1');

    expect(await kinds()).toEqual(['version-added']);
    expect(await dmsNotification(`version-added:${document._id}`)).toMatchObject({
      data: { versionNumber: 2 },
    });
  });
});
