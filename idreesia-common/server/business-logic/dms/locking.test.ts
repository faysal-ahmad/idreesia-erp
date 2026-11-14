import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  DMS_DEFAULT_LOCK_MINUTES,
  DMS_MAX_LOCK_MINUTES,
} from 'meteor/idreesia-common/constants/dms';

import { checkInDocument, checkOutDocument, forceUnlockDocument } from './locking';
import { updateDocument } from './documents';
import { publishExpiringLockNotifications } from './notifications';
import {
  createTestDocument,
  committeeOf,
  createTestWorkspace,
  dmsNotification,
  dmsNotifications,
  HOUR,
  DAY,
  lockOf,
  NOW,
} from './test-helpers';

vi.mock('meteor/idreesia-common/server/file-storage', async () =>
  import('meteor/idreesia-common/server/test-utils/file-storage-mock')
);

let workspaceId: string;
let documentId: string;

beforeEach(async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(NOW);
  workspaceId = await createTestWorkspace();
  documentId = (await createTestDocument(workspaceId))._id;
});
afterEach(() => {
  vi.useRealTimers();
});

const rejectsWith = (promise: Promise<unknown>, code: string) =>
  expect(promise).rejects.toMatchObject({ extensions: { code } });

describe('checkOutDocument', () => {
  it('locks for 7 days when no duration is given', async () => {
    const document = await checkOutDocument(documentId, 'u1');

    expect(document.lock!.userId).toBe('u1');
    expect(document.lock!.lockedAt).toEqual(NOW);
    expect(document.lock!.expiresAt).toEqual(
      new Date(NOW.getTime() + DMS_DEFAULT_LOCK_MINUTES * 60 * 1000)
    );
    expect(DMS_DEFAULT_LOCK_MINUTES).toBe(7 * 24 * 60);
  });

  it('locks for the duration asked for', async () => {
    const document = await checkOutDocument(documentId, 'u1', {
      expiresInMinutes: 90,
    });
    expect(document.lock!.expiresAt).toEqual(new Date(NOW.getTime() + 90 * 60 * 1000));
  });

  it('allows exactly the maximum', async () => {
    const document = await checkOutDocument(documentId, 'u1', {
      expiresInMinutes: DMS_MAX_LOCK_MINUTES,
    });
    expect(document.lock!.expiresAt).toEqual(new Date(NOW.getTime() + 7 * DAY));
  });

  it.each([
    ['over the maximum', DMS_MAX_LOCK_MINUTES + 1],
    ['zero', 0],
    ['negative', -5],
    ['not a number', Number.NaN],
    ['infinite', Number.POSITIVE_INFINITY],
  ])('rejects a duration that is %s', async (_label, minutes) => {
    await rejectsWith(
      checkOutDocument(documentId, 'u1', { expiresInMinutes: minutes }),
      'BAD_USER_INPUT'
    );
  });

  it('lets the holder renew, starting the time again', async () => {
    await checkOutDocument(documentId, 'u1', { expiresInMinutes: 60 });

    vi.setSystemTime(new Date(NOW.getTime() + 30 * 60 * 1000));
    const renewed = await checkOutDocument(documentId, 'u1', {
      expiresInMinutes: 120,
    });

    expect(renewed.lock!.lockedAt).toEqual(new Date(NOW.getTime() + 30 * 60 * 1000));
    expect(renewed.lock!.expiresAt).toEqual(new Date(NOW.getTime() + 150 * 60 * 1000));
  });

  it('refuses another user while the lock is active', async () => {
    await checkOutDocument(documentId, 'u1');
    await rejectsWith(checkOutDocument(documentId, 'u2'), 'LOCKED');
  });

  it('lets another user take over once the lock has expired', async () => {
    await checkOutDocument(documentId, 'u1', { expiresInMinutes: 60 });

    vi.setSystemTime(new Date(NOW.getTime() + 2 * HOUR));
    const document = await checkOutDocument(documentId, 'u2');

    expect(document.lock!.userId).toBe('u2');
  });
});

describe('lock protection', () => {
  it('blocks changes by others while the lock is active, and not after it expires', async () => {
    await checkOutDocument(documentId, 'u1', { expiresInMinutes: 60 });

    await rejectsWith(updateDocument(documentId, { name: 'Renamed' }, 'u2'), 'LOCKED');
    await expect(
      updateDocument(documentId, { name: 'By holder' }, 'u1')
    ).resolves.toBeDefined();

    vi.setSystemTime(new Date(NOW.getTime() + 2 * HOUR));
    await expect(
      updateDocument(documentId, { name: 'After expiry' }, 'u2')
    ).resolves.toBeDefined();
  });
});

describe('checkInDocument', () => {
  it('releases the lock for the holder', async () => {
    await checkOutDocument(documentId, 'u1');
    const document = await checkInDocument(documentId, 'u1');
    expect(document.lock).toBeUndefined();
  });

  it('refuses anyone but the holder while the lock is active', async () => {
    await checkOutDocument(documentId, 'u1');
    await rejectsWith(checkInDocument(documentId, 'u2'), 'LOCKED');
  });

  it('fails for a document that is not checked out', async () => {
    await rejectsWith(checkInDocument(documentId, 'u1'), 'CONFLICT');
  });
});

describe('forceUnlockDocument', () => {
  it('tells the previous holder, with the forcing user as the actor', async () => {
    await checkOutDocument(documentId, 'u1');
    const lockedAt = NOW.getTime();

    await forceUnlockDocument(documentId, 'manager');

    const notification = await dmsNotification(`force-unlocked:${documentId}:${lockedAt}`);
    expect(notification).toMatchObject({
      committeeId: committeeOf(workspaceId),
      entityType: 'document',
      entityId: documentId,
      eventType: 'document-force-unlocked',
      recipientUserId: 'u1',
      actorUserId: 'manager',
      readBy: [],
    });
  });

  it('does not tell users who remove their own lock', async () => {
    await checkOutDocument(documentId, 'u1');
    await forceUnlockDocument(documentId, 'u1');
    expect(await dmsNotifications()).toEqual([]);
  });

  it('does nothing for an unlocked document', async () => {
    await forceUnlockDocument(documentId, 'manager');
    expect(await dmsNotifications()).toEqual([]);
  });
});

describe('the pending "expires soon" warning', () => {
  const longLockExpiringSoon = async () => {
    // A 3-day lock taken 2.5 days ago: 12 hours left.
    const lockedAt = new Date(NOW.getTime() - 2.5 * DAY);
    const document = await createTestDocument(workspaceId, {
      lock: lockOf('u1', lockedAt, 3 * 24 * 60),
    });
    await publishExpiringLockNotifications(NOW);
    return { document, id: `lock-expiring:${document._id}:${lockedAt.getTime()}` };
  };

  it('is withdrawn when the holder checks in', async () => {
    const { document, id } = await longLockExpiringSoon();
    expect(await dmsNotification(id)).toBeDefined();

    await checkInDocument(document._id, 'u1');

    expect(await dmsNotification(id)).toBeUndefined();
  });

  it('is withdrawn when the lock is force-unlocked', async () => {
    const { document, id } = await longLockExpiringSoon();

    await forceUnlockDocument(document._id, 'manager');

    expect(await dmsNotification(id)).toBeUndefined();
  });

  it('is withdrawn when the holder renews the lock', async () => {
    const { document, id } = await longLockExpiringSoon();

    await checkOutDocument(document._id, 'u1', { expiresInMinutes: 60 });

    expect(await dmsNotification(id)).toBeUndefined();
  });
});
