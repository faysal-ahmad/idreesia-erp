import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Committees from 'meteor/idreesia-common/server/collections/hr/committees';
import { createNotifier } from 'meteor/idreesia-common/server/headless';

import resolvers from './resolvers';

const NOW = new Date('2026-06-01T12:00:00Z');
const dms = createNotifier('dms');

const { Query, Mutation } = resolvers as unknown as {
  Query: Record<string, (...args: any[]) => Promise<any>>;
  Mutation: Record<string, (...args: any[]) => Promise<any>>;
};

const user = { _id: 'u1', personId: 'p1' };
const context = (u: unknown = user) => ({ user: u });

let committeeId: string;

const publish = (id: string, overrides: Record<string, unknown> = {}) =>
  dms.publish({
    id,
    workspaceId: 'dms1',
    entityType: 'document',
    entityId: 'doc1',
    eventType: 'document-created',
    eventDetails: `Event ${id}`,
    createdAt: NOW,
    ...overrides,
  });

beforeEach(async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(NOW);
  committeeId = (await Committees.insertAsync({
    name: 'Committee',
    members: [{ karkunId: 'p1' }],
    features: ['documents'],
    dmsWorkspaceId: 'dms1',
  } as any)) as string;
});
afterEach(() => {
  vi.useRealTimers();
});

describe('myNotifications', () => {
  it('returns the notifications of the user\'s committees, with the committee and dates as text', async () => {
    await publish('a', { data: { versionNumber: 2 }, actorUserId: 'u2' });

    const result = await Query.myNotifications(null, {}, context());

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      _id: 'dms:a',
      module: 'dms',
      committeeId,
      entityType: 'document',
      entityId: 'doc1',
      eventType: 'document-created',
      eventDetails: 'Event a',
      createdAt: NOW.toISOString(),
      updatedAt: NOW.toISOString(),
      actorUserId: 'u2',
      recipientUserId: null,
      isRead: false,
    });
    expect(JSON.parse(result[0].data)).toEqual({ versionNumber: 2 });
  });

  it('leaves out other committees\' and other users\' notifications', async () => {
    await publish('mine');
    await publish('elsewhere', { workspaceId: 'dms-other' });
    await publish('theirs', { recipientUserId: 'u2' });

    const result = await Query.myNotifications(null, {}, context());

    expect(result.map((n: any) => n._id)).toEqual(['dms:mine']);
  });

  it('respects the limit', async () => {
    await publish('a');
    vi.setSystemTime(new Date(NOW.getTime() + 1000));
    await publish('b');

    const result = await Query.myNotifications(null, { limit: 1 }, context());

    expect(result.map((n: any) => n._id)).toEqual(['dms:b']);
  });

  it('is empty for a user with no person, such as erp-admin, or no user at all', async () => {
    await publish('a');

    expect(await Query.myNotifications(null, {}, context({ _id: 'admin' }))).toEqual([]);
    expect(await Query.myNotifications(null, {}, context(null))).toEqual([]);
  });

  it('is empty once the committee turns the feature off', async () => {
    await publish('a');
    await Committees.updateAsync(committeeId, { $set: { features: [] } });

    expect(await Query.myNotifications(null, {}, context())).toEqual([]);
  });
});

describe('myNotificationCounts', () => {
  it('counts unread notifications per committee and module', async () => {
    await publish('a');
    await publish('b');
    await publish('c');
    await Mutation.markNotificationsRead(null, { ids: ['dms:c'] }, context());

    const result = await Query.myNotificationCounts(null, {}, context());

    expect(result).toEqual([{ committeeId, module: 'dms', unreadCount: 2 }]);
  });

  it('is empty without a person or user', async () => {
    await publish('a');
    expect(await Query.myNotificationCounts(null, {}, context({ _id: 'u1' }))).toEqual([]);
    expect(await Query.myNotificationCounts(null, {}, context(null))).toEqual([]);
  });
});

describe('myNotifications filters', () => {
  it('narrows to a committee and a module', async () => {
    await publish('a');
    expect(
      await Query.myNotifications(null, { committeeId, module: 'dms' }, context())
    ).toHaveLength(1);
    expect(
      await Query.myNotifications(null, { committeeId: 'other' }, context())
    ).toHaveLength(0);
    expect(
      await Query.myNotifications(null, { module: 'discussions' }, context())
    ).toHaveLength(0);
  });
});

describe('myUnreadNotificationCount', () => {
  it('counts what the user has not read yet', async () => {
    await publish('a');
    await publish('b');
    await Mutation.markNotificationsRead(null, { ids: ['dms:a'] }, context());

    expect(await Query.myUnreadNotificationCount(null, {}, context())).toBe(1);
  });

  it('is zero without a person or user', async () => {
    await publish('a');

    expect(await Query.myUnreadNotificationCount(null, {}, context({ _id: 'admin' }))).toBe(0);
    expect(await Query.myUnreadNotificationCount(null, {}, context(null))).toBe(0);
  });
});

describe('markNotificationsRead', () => {
  it('marks them read for the user, and returns true', async () => {
    await publish('a');

    const result = await Mutation.markNotificationsRead(null, { ids: ['dms:a'] }, context());

    expect(result).toBe(true);
    const [shown] = await Query.myNotifications(null, {}, context());
    expect(shown.isRead).toBe(true);
  });

  it('does not touch notifications the user cannot see', async () => {
    await publish('theirs', { recipientUserId: 'u2' });
    await publish('elsewhere', { workspaceId: 'dms-other' });

    await Mutation.markNotificationsRead(
      null,
      { ids: ['dms:theirs', 'dms:elsewhere'] },
      context()
    );

    const other = await Query.myNotifications(null, {}, context({ _id: 'u2', personId: 'p1' }));
    expect(other.find((n: any) => n._id === 'dms:theirs').isRead).toBe(false);
  });

  it('ignores empty ids and users without a person', async () => {
    await publish('a');

    await expect(
      Mutation.markNotificationsRead(null, { ids: [null, ''] }, context())
    ).resolves.toBe(true);
    await expect(
      Mutation.markNotificationsRead(null, { ids: ['dms:a'] }, context({ _id: 'admin' }))
    ).resolves.toBe(true);

    const [shown] = await Query.myNotifications(null, {}, context());
    expect(shown.isRead).toBe(false);
  });
});
