import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Notifications from 'meteor/idreesia-common/server/collections/common/notifications';
import Committees from 'meteor/idreesia-common/server/collections/hr/committees';

import { createCommitteeNotifier, createNotifier, purgeNotifications } from './notifications';
import type { ModuleNotification } from './types';

const DAY = 24 * 60 * 60 * 1000;
const NOW = new Date('2026-06-01T12:00:00Z');

const notification = (
  overrides: Partial<ModuleNotification> = {}
): ModuleNotification => ({
  id: 'n1',
  workspaceId: 'ws1',
  entityType: 'document',
  entityId: 'doc1',
  eventType: 'document-created',
  eventDetails: 'New document "Minutes".',
  createdAt: NOW,
  ...overrides,
});

const stored = async (id = 'dms:n1') =>
  (await Notifications.findOneAsync(id)) as any;

describe('notifier', () => {
  const dms = createNotifier('dms');

  beforeEach(async () => {
    // One committee owns workspace ws1 in each module under test.
    await Committees.insertAsync({
      _id: 'c1',
      name: 'Committee',
      members: [],
      dmsWorkspaceId: 'ws1',
      discussionsWorkspaceId: 'ws1',
      meetingsWorkspaceId: 'ws1',
    } as any);
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  describe('publish', () => {
    it('stores a new notification under <module>:<id>, unread by everyone', async () => {
      await dms.publish(notification({ recipientUserId: 'u1', actorUserId: 'u2' }));

      const doc = await stored();
      expect(doc).toMatchObject({
        _id: 'dms:n1',
        module: 'dms',
        committeeId: 'c1',
        entityType: 'document',
        entityId: 'doc1',
        eventType: 'document-created',
        eventDetails: 'New document "Minutes".',
        recipientUserId: 'u1',
        actorUserId: 'u2',
        readBy: [],
      });
      expect(doc.createdAt).toEqual(NOW);
      expect(doc.updatedAt).toEqual(NOW);
    });

    it('leaves an identical republish alone, keeping read state and timestamps', async () => {
      await dms.publish(notification());
      await Notifications.updateAsync('dms:n1', { $addToSet: { readBy: 'u1' } });

      vi.setSystemTime(new Date(NOW.getTime() + DAY));
      await dms.publish(notification());

      const doc = await stored();
      expect(doc.readBy).toEqual(['u1']);
      expect(doc.updatedAt).toEqual(NOW);
    });

    it('updates changed content, makes it unread again, and keeps createdAt', async () => {
      await dms.publish(notification({ eventDetails: '3 unread' }));
      await Notifications.updateAsync('dms:n1', { $addToSet: { readBy: 'u1' } });

      const later = new Date(NOW.getTime() + DAY);
      vi.setSystemTime(later);
      await dms.publish(
        notification({ eventDetails: '5 unread', createdAt: later })
      );

      const doc = await stored();
      expect(doc.eventDetails).toBe('5 unread');
      expect(doc.readBy).toEqual([]);
      expect(doc.updatedAt).toEqual(later);
      expect(doc.createdAt).toEqual(NOW);
    });

    it('removes fields the module stops sending', async () => {
      await dms.publish(
        notification({
          recipientUserId: 'u1',
          actorUserId: 'u2',
          data: { versionNumber: 2 },
          expiresAt: new Date(NOW.getTime() + DAY),
        })
      );
      await dms.publish(notification());

      const doc = await stored();
      expect(doc).not.toHaveProperty('recipientUserId');
      expect(doc).not.toHaveProperty('actorUserId');
      expect(doc).not.toHaveProperty('data');
      expect(doc).not.toHaveProperty('expiresAt');
    });

    it('does not store a notification that has already expired', async () => {
      await dms.publish(notification({ expiresAt: new Date(NOW.getTime() - 1) }));
      expect(await stored()).toBeUndefined();
    });

    it('keeps notifications of different modules apart, even with the same id', async () => {
      const meetings = createNotifier('meetings');
      await dms.publish(notification({ eventDetails: 'from dms' }));
      await meetings.publish(notification({ eventDetails: 'from meetings' }));

      expect((await stored('dms:n1')).eventDetails).toBe('from dms');
      expect((await stored('meetings:n1')).eventDetails).toBe('from meetings');
    });

    it('recovers when the same notification is published twice at once', async () => {
      await Promise.all([
        dms.publish(notification({ eventDetails: 'a' })),
        dms.publish(notification({ eventDetails: 'b' })),
      ]);

      const docs = await Notifications.find({ module: 'dms' }).fetchAsync();
      expect(docs).toHaveLength(1);
      expect(['a', 'b']).toContain((docs[0] as any).eventDetails);
    });
  });

  describe('committee', () => {
    it('is found by the ERP from the committee that owns the workspace, and the workspace is not stored', async () => {
      await dms.publish(notification());

      const doc = await stored();
      expect(doc.committeeId).toBe('c1');
      expect(doc).not.toHaveProperty('workspaceId');
    });

    it('is found for each module through that module\'s own workspace field', async () => {
      const other = (await Committees.insertAsync({
        name: 'Other',
        members: [],
        discussionsWorkspaceId: 'ws2',
      } as any)) as string;

      await createNotifier('discussions').publish(notification({ workspaceId: 'ws2' }));

      expect((await stored('discussions:n1')).committeeId).toBe(other);
    });

    it('is not stored when no committee owns the workspace or the module is not committee-backed', async () => {
      await dms.publish(notification({ id: 'x', workspaceId: 'unknown' }));
      await createNotifier('something-else').publish(notification());

      expect(await stored('dms:x')).toBeUndefined();
      expect(await stored('something-else:n1')).toBeUndefined();
    });

    it('cannot be set by a module', async () => {
      await dms.publish({ ...notification(), committeeId: 'forged' } as any);

      expect((await stored()).committeeId).toBe('c1');
    });
  });

  describe('committee notifier', () => {
    it('stores a notification for the committee it names, with no workspace involved', async () => {
      await createCommitteeNotifier('members').publish({
        id: 'm1',
        committeeId: 'c9',
        entityType: 'member',
        entityId: 'k1',
        eventType: 'member-added',
        eventDetails: 'Added.',
        createdAt: NOW,
      });

      expect(await stored('members:m1')).toMatchObject({ module: 'members', committeeId: 'c9' });
    });
  });

  describe('retire', () => {
    it('removes only that module\'s notification', async () => {
      const meetings = createNotifier('meetings');
      await dms.publish(notification());
      await meetings.publish(notification());

      await dms.retire('n1');

      expect(await stored('dms:n1')).toBeUndefined();
      expect(await stored('meetings:n1')).toBeDefined();
    });

    it('does nothing for a notification that does not exist', async () => {
      await expect(dms.retire('missing')).resolves.toBeUndefined();
    });
  });
});

describe('purgeNotifications', () => {
  const dms = createNotifier('dms');

  beforeEach(async () => {
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
  });

  it('removes expired notifications and ones not updated for 90 days, keeps the rest', async () => {
    await dms.publish(notification({ id: 'current' }));
    await dms.publish(
      notification({ id: 'expiring', expiresAt: new Date(NOW.getTime() + DAY) })
    );
    await dms.publish(notification({ id: 'old' }));

    // 91 days later: 'old' is stale and 'expiring' has expired; 'current' is
    // refreshed so it survives.
    vi.setSystemTime(new Date(NOW.getTime() + 91 * DAY));
    await dms.publish(notification({ id: 'current', eventDetails: 'changed' }));

    const removed = await purgeNotifications();

    expect(removed).toBe(2);
    const left = (await Notifications.find({}).fetchAsync()).map(doc => doc._id);
    expect(left).toEqual(['dms:current']);
  });
});
