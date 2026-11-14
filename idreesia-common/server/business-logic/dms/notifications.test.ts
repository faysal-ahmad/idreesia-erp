import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Notifications from 'meteor/idreesia-common/server/collections/common/notifications';
import Committees from 'meteor/idreesia-common/server/collections/hr/committees';
import { markNotificationsRead } from 'meteor/idreesia-common/server/headless';

import {
  buildDocumentAddedNotification,
  buildForceUnlockedNotification,
  buildLockExpiringNotification,
  buildVersionAddedNotification,
  isLockExpiringSoon,
  notifyDocumentAdded,
  notifyForceUnlocked,
  notifyVersionAdded,
  publishExpiringLockNotifications,
} from './notifications';
import {
  createTestDocument,
  committeeOf,
  createTestWorkspace,
  dmsNotification,
  dmsNotifications,
  DAY,
  HOUR,
  lockOf,
  NOW,
} from './test-helpers';

vi.mock('meteor/idreesia-common/server/file-storage', async () =>
  import('meteor/idreesia-common/server/test-utils/file-storage-mock')
);

const doc = { _id: 'doc1', workspaceId: 'ws1', name: 'Minutes' };

beforeEach(async () => {
  // The committee that owns workspace ws1.
  await Committees.insertAsync({
    _id: 'c1',
    name: 'Committee',
    members: [],
    dmsWorkspaceId: 'ws1',
  } as any);
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(NOW);
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('#1 force-unlocked', () => {
  const lockedAt = new Date(NOW.getTime() - HOUR);
  const locked = { ...doc, lock: lockOf('u1', lockedAt, 60 * 24) };

  it('goes to the previous holder, with the forcing user as the actor', () => {
    expect(buildForceUnlockedNotification(locked, 'manager')).toMatchObject({
      id: `force-unlocked:doc1:${lockedAt.getTime()}`,
      workspaceId: 'ws1',
      entityType: 'document',
      entityId: 'doc1',
      eventType: 'document-force-unlocked',
      recipientUserId: 'u1',
      actorUserId: 'manager',
    });
  });

  it('names the document', () => {
    expect(buildForceUnlockedNotification(locked, 'manager')!.eventDetails).toContain(
      '"Minutes"'
    );
  });

  it('is not sent when the holder removes their own lock', () => {
    expect(buildForceUnlockedNotification(locked, 'u1')).toBeNull();
  });
});

describe('#4 document added', () => {
  it('is for everyone in the workspace, with the creator as the actor', () => {
    const notification = buildDocumentAddedNotification(doc, 'u1');

    expect(notification).toMatchObject({
      id: 'document-added:doc1',
      workspaceId: 'ws1',
      entityType: 'document',
      entityId: 'doc1',
      eventType: 'document-created',
      actorUserId: 'u1',
    });
    expect(notification).not.toHaveProperty('recipientUserId');
    expect(notification.eventDetails).toContain('"Minutes"');
  });
});

describe('#5 version added', () => {
  it('is for everyone, with one stable id per document and the version number', () => {
    const notification = buildVersionAddedNotification(doc, 4, 'u1')!;

    expect(notification).toMatchObject({
      id: 'version-added:doc1',
      eventType: 'version-added',
      actorUserId: 'u1',
      data: { versionNumber: 4 },
    });
    expect(notification).not.toHaveProperty('recipientUserId');
    expect(notification.eventDetails).toContain('4');
  });

  it.each([1, 0, undefined])('is skipped for version %s (that is the document being added)', versionNumber => {
    expect(buildVersionAddedNotification(doc, versionNumber, 'u1')).toBeNull();
  });
});

describe('isLockExpiringSoon', () => {
  const lock = (lockedAgoHours: number, minutesLong: number) =>
    lockOf('u1', new Date(NOW.getTime() - lockedAgoHours * HOUR), minutesLong);

  it('is true for a long lock that ends within 24 hours', () => {
    // 3 days long, 2.5 days ago: 12 hours left.
    expect(isLockExpiringSoon(lock(60, 72 * 60), NOW)).toBe(true);
  });

  it('is true right at the 24 hour mark', () => {
    // 3 days long, 2 days ago: exactly 24 hours left.
    expect(isLockExpiringSoon(lock(48, 72 * 60), NOW)).toBe(true);
  });

  it('is false while more than 24 hours remain', () => {
    expect(isLockExpiringSoon(lock(24, 72 * 60), NOW)).toBe(false);
  });

  it('is false for a lock that was never longer than 24 hours', () => {
    expect(isLockExpiringSoon(lock(0.5, 60), NOW)).toBe(false);
    expect(isLockExpiringSoon(lock(0, 24 * 60), NOW)).toBe(false);
  });

  it('is false once the lock has expired', () => {
    expect(isLockExpiringSoon(lock(80, 72 * 60), NOW)).toBe(false);
  });
});

describe('#2 lock expiring', () => {
  it('goes to the holder and disappears when the lock lapses', () => {
    const lockedAt = new Date(NOW.getTime() - 60 * HOUR);
    const locked = { ...doc, lock: lockOf('u1', lockedAt, 72 * 60) };

    const notification = buildLockExpiringNotification(locked, NOW);

    expect(notification).toMatchObject({
      id: `lock-expiring:doc1:${lockedAt.getTime()}`,
      eventType: 'lock-expiring',
      recipientUserId: 'u1',
      expiresAt: locked.lock.expiresAt,
    });
  });
});

describe('publishExpiringLockNotifications (the scheduled job)', () => {
  let workspaceId: string;

  const withLock = (lockedAgoHours: number, minutesLong: number, extra = {}) =>
    createTestDocument(workspaceId, {
      lock: lockOf('u1', new Date(NOW.getTime() - lockedAgoHours * HOUR), minutesLong),
      ...extra,
    });

  beforeEach(async () => {
    workspaceId = await createTestWorkspace();
  });

  it('warns the holder of a long lock that ends within 24 hours', async () => {
    const document = await withLock(60, 72 * 60);

    expect(await publishExpiringLockNotifications(NOW)).toBe(1);

    const [notification] = await dmsNotifications();
    expect(notification).toMatchObject({
      entityId: document._id,
      committeeId: committeeOf(workspaceId),
      recipientUserId: 'u1',
      eventType: 'lock-expiring',
      expiresAt: document.lock!.expiresAt,
    });
  });

  it('skips locks with more than 24 hours left, short locks, expired locks, trashed documents and unlocked ones', async () => {
    await withLock(24, 72 * 60); // 48 hours left
    await withLock(0.5, 60); // short lock, nearly over
    await withLock(80, 72 * 60); // already expired
    await withLock(60, 72 * 60, { trashed: true });
    await createTestDocument(workspaceId); // no lock

    expect(await publishExpiringLockNotifications(NOW)).toBe(0);
    expect(await dmsNotifications()).toEqual([]);
  });

  it('can run again without changing anything, so a read warning stays read', async () => {
    await withLock(60, 72 * 60);
    await publishExpiringLockNotifications(NOW);
    const [first] = await dmsNotifications();
    await markNotificationsRead(
      'u1',
      [{ committeeId: committeeOf(workspaceId), module: 'dms' }],
      [first._id]
    );

    vi.setSystemTime(new Date(NOW.getTime() + 10 * 60 * 1000));
    await publishExpiringLockNotifications(new Date(NOW.getTime() + 10 * 60 * 1000));

    const all = await dmsNotifications();
    expect(all).toHaveLength(1);
    expect(all[0].readBy).toEqual(['u1']);
    expect(all[0].updatedAt).toEqual(first.updatedAt);
  });

  it('warns once per lock, and again for a new lock on the same document', async () => {
    const document = await withLock(60, 72 * 60);
    await publishExpiringLockNotifications(NOW);

    // The holder renews with a new long lock that is again about to end.
    const later = new Date(NOW.getTime() + 8 * DAY);
    await Notifications.removeAsync({});
    const lockedAt = new Date(later.getTime() - 60 * HOUR);
    await (await import('meteor/idreesia-common/server/collections/dms/documents')).default.updateAsync(
      document._id,
      { $set: { lock: lockOf('u1', lockedAt, 72 * 60) } }
    );
    await publishExpiringLockNotifications(later);

    const [notification] = await dmsNotifications();
    expect(notification._id).toBe(`dms:lock-expiring:${document._id}:${lockedAt.getTime()}`);
  });
});

describe('publishing is best effort', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(Notifications, 'insertAsync').mockRejectedValue(new Error('database down'));
  });

  it('logs and carries on when a notification cannot be stored', async () => {
    await expect(notifyDocumentAdded(doc, 'u1')).resolves.toBeUndefined();
    await expect(notifyVersionAdded(doc, 3, 'u1')).resolves.toBeUndefined();
    await expect(
      notifyForceUnlocked(
        { ...doc, lock: lockOf('u1', NOW, 60) },
        'manager'
      )
    ).resolves.toBeUndefined();
    // eslint-disable-next-line no-console
    expect(console.error).toHaveBeenCalledTimes(3);
  });

  it('does not fail the scheduled job either', async () => {
    const workspaceId = await createTestWorkspace();
    await createTestDocument(workspaceId, {
      lock: lockOf('u1', new Date(NOW.getTime() - 60 * HOUR), 72 * 60),
    });

    await expect(publishExpiringLockNotifications(NOW)).resolves.toBe(1);
  });
});

describe('publishing', () => {
  it('stores #4 for everyone and collapses #5 into one updated notification', async () => {
    await notifyDocumentAdded(doc, 'u1');
    expect(await dmsNotification('document-added:doc1')).toMatchObject({
      module: 'dms',
      committeeId: 'c1',
      readBy: [],
    });

    await notifyVersionAdded(doc, 2, 'u1');
    await markNotificationsRead(
      'u2',
      [{ committeeId: 'c1', module: 'dms' }],
      ['dms:version-added:doc1']
    );
    vi.setSystemTime(new Date(NOW.getTime() + HOUR));
    await notifyVersionAdded(doc, 3, 'u1');

    const versionNotifications = (await dmsNotifications()).filter(
      n => n.eventType === 'version-added'
    );
    expect(versionNotifications).toHaveLength(1);
    expect(versionNotifications[0].data).toEqual({ versionNumber: 3 });
    // Unread again for everyone who had read the earlier one.
    expect(versionNotifications[0].readBy).toEqual([]);
  });

  it('does not publish for version 1', async () => {
    await notifyVersionAdded(doc, 1, 'u1');
    expect(await dmsNotifications()).toEqual([]);
  });
});
