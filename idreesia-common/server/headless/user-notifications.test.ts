import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Committees from 'meteor/idreesia-common/server/collections/hr/committees';

import { createCommitteeNotifier, createNotifier } from './notifications';
import {
  countUnreadNotifications,
  getUserNotifications,
  markNotificationsRead,
} from './user-notifications';
import type { ModuleNotification } from './types';

const HOUR = 60 * 60 * 1000;
const NOW = new Date('2026-06-01T12:00:00Z');
const dms = createNotifier('dms');

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

// Workspaces ws1 and ws2 belong to committees c1 and c2.
const scope = (committeeIds: string[] = [], module = 'dms') =>
  committeeIds.map(committeeId => ({ committeeId, module }));

const idsFor = async (userId: string, committeeIds = ['c1']) =>
  (await getUserNotifications(userId, scope(committeeIds))).map(n => n._id);

beforeEach(async () => {
  await Committees.insertAsync({ _id: 'c1', name: 'One', members: [], dmsWorkspaceId: 'ws1' } as any);
  await Committees.insertAsync({ _id: 'c2', name: 'Two', members: [], dmsWorkspaceId: 'ws2' } as any);
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(NOW);
});
afterEach(() => {
  vi.useRealTimers();
});

describe('getUserNotifications', () => {
  it('shows notifications addressed to the user and ones for everyone, not other users\'', async () => {
    await dms.publish(notification({ id: 'mine', recipientUserId: 'u1' }));
    await dms.publish(notification({ id: 'everyone' }));
    await dms.publish(notification({ id: 'theirs', recipientUserId: 'u2' }));

    expect((await idsFor('u1')).sort()).toEqual(['dms:everyone', 'dms:mine']);
    expect((await idsFor('u2')).sort()).toEqual(['dms:everyone', 'dms:theirs']);
  });

  it('only covers the given workspaces', async () => {
    await dms.publish(notification({ id: 'a', workspaceId: 'ws1' }));
    await dms.publish(notification({ id: 'b', workspaceId: 'ws2' }));

    expect(await idsFor('u1', ['c1'])).toEqual(['dms:a']);
    expect((await idsFor('u1', ['c1', 'c2'])).sort()).toEqual(['dms:a', 'dms:b']);
    expect(await idsFor('u1', [])).toEqual([]);
  });

  it('leaves out expired notifications', async () => {
    await dms.publish(
      notification({ id: 'soon', expiresAt: new Date(NOW.getTime() + HOUR) })
    );
    expect(await idsFor('u1')).toEqual(['dms:soon']);

    vi.setSystemTime(new Date(NOW.getTime() + 2 * HOUR));
    expect(await idsFor('u1')).toEqual([]);
  });

  it('leaves out notifications the user caused themselves', async () => {
    await dms.publish(notification({ id: 'own', actorUserId: 'u1' }));
    await dms.publish(notification({ id: 'other', actorUserId: 'u2' }));

    expect(await idsFor('u1')).toEqual(['dms:other']);
    expect(await idsFor('u2')).toEqual(['dms:own']);
  });

  it('flags what the user has read, per user', async () => {
    await dms.publish(notification({ id: 'n' }));
    await markNotificationsRead('u1', scope(['c1']), ['dms:n']);

    const [forU1] = await getUserNotifications('u1', scope(['c1']));
    const [forU2] = await getUserNotifications('u2', scope(['c1']));
    expect(forU1.isRead).toBe(true);
    expect(forU2.isRead).toBe(false);
  });

  it('lists the most recently changed first, and respects the limit', async () => {
    await dms.publish(notification({ id: 'first' }));
    vi.setSystemTime(new Date(NOW.getTime() + HOUR));
    await dms.publish(notification({ id: 'second' }));
    vi.setSystemTime(new Date(NOW.getTime() + 2 * HOUR));
    await dms.publish(notification({ id: 'third' }));

    expect(await idsFor('u1')).toEqual(['dms:third', 'dms:second', 'dms:first']);
    const limited = await getUserNotifications('u1', scope(['c1']), { limit: 2 });
    expect(limited.map(n => n._id)).toEqual(['dms:third', 'dms:second']);
  });

  it('shows a changed notification as unread again', async () => {
    await dms.publish(notification({ id: 'n', eventDetails: 'v2' }));
    await markNotificationsRead('u1', scope(['c1']), ['dms:n']);

    vi.setSystemTime(new Date(NOW.getTime() + HOUR));
    await dms.publish(notification({ id: 'n', eventDetails: 'v3' }));

    const [shown] = await getUserNotifications('u1', scope(['c1']));
    expect(shown.isRead).toBe(false);
  });
});

describe('markNotificationsRead', () => {
  it('adds the user once, however many times it is called', async () => {
    await dms.publish(notification({ id: 'n' }));

    await markNotificationsRead('u1', scope(['c1']), ['dms:n']);
    await markNotificationsRead('u1', scope(['c1']), ['dms:n']);

    const [shown] = await getUserNotifications('u1', scope(['c1']));
    expect(shown.readBy).toEqual(['u1']);
  });

  it('does not mark them read for anyone else', async () => {
    await dms.publish(notification({ id: 'n' }));
    await markNotificationsRead('u1', scope(['c1']), ['dms:n']);

    const [shown] = await getUserNotifications('u2', scope(['c1']));
    expect(shown.isRead).toBe(false);
  });

  it('cannot mark notifications the user cannot see', async () => {
    await dms.publish(notification({ id: 'theirs', recipientUserId: 'u2' }));
    await dms.publish(notification({ id: 'elsewhere', workspaceId: 'ws2' }));
    await dms.publish(notification({ id: 'own', actorUserId: 'u1' }));

    await markNotificationsRead('u1', scope(['c1']),
      ['dms:theirs', 'dms:elsewhere', 'dms:own']
    );

    const asU2 = await getUserNotifications('u2', scope(['c1', 'c2']));
    expect(asU2.every(n => !n.readBy.includes('u1'))).toBe(true);
    const own = (await getUserNotifications('u2', scope(['c1']))).find(n => n._id === 'dms:own');
    expect(own?.readBy).toEqual([]);
  });

  it('does nothing with no ids or no workspaces', async () => {
    await dms.publish(notification({ id: 'n' }));
    await markNotificationsRead('u1', scope(['c1']), []);
    await markNotificationsRead('u1', scope([]), ['dms:n']);

    const [shown] = await getUserNotifications('u1', scope(['c1']));
    expect(shown.isRead).toBe(false);
  });
});

describe('countUnreadNotifications', () => {
  it('counts the visible notifications the user has not read', async () => {
    await dms.publish(notification({ id: 'a' }));
    await dms.publish(notification({ id: 'b' }));
    await dms.publish(notification({ id: 'c', recipientUserId: 'u2' }));
    await markNotificationsRead('u1', scope(['c1']), ['dms:a']);

    expect(await countUnreadNotifications('u1', scope(['c1']))).toBe(1);
    expect(await countUnreadNotifications('u2', scope(['c1']))).toBe(3);
    expect(await countUnreadNotifications('u1', scope([]))).toBe(0);
  });
});

describe('committee notifications (named by committee)', () => {
  const members = createCommitteeNotifier('members');
  const memberEvent = {
    id: 'm1',
    committeeId: 'c1',
    entityType: 'member',
    entityId: 'k1',
    eventType: 'member-added',
    eventDetails: 'Someone was added.',
    createdAt: NOW,
  };

  it('is stored for the committee it names', async () => {
    await members.publish(memberEvent);
    const [shown] = await getUserNotifications('u1', scope(['c1'], 'members'));
    expect(shown.committeeId).toBe('c1');
  });

  it('is visible only for its committee and module', async () => {
    await members.publish(memberEvent);
    expect(await getUserNotifications('u1', scope(['c1']))).toHaveLength(0);
    expect(await getUserNotifications('u1', scope(['c2'], 'members'))).toHaveLength(0);
  });

  it('applies the same recipient, actor and read rules', async () => {
    await members.publish({ ...memberEvent, recipientUserId: 'u1', actorUserId: 'u2' });
    expect(await getUserNotifications('u1', scope(['c1'], 'members'))).toHaveLength(1);
    expect(await getUserNotifications('u2', scope(['c1'], 'members'))).toHaveLength(0);
    expect(await countUnreadNotifications('u1', scope(['c1'], 'members'))).toBe(1);
    await markNotificationsRead('u1', scope(['c1'], 'members'), ['members:m1']);
    expect(await countUnreadNotifications('u1', scope(['c1'], 'members'))).toBe(0);
  });
});
