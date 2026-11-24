import { subMinutes } from 'date-fns';
import { describe, expect, it } from 'vitest';

import {
  UserGroups,
  Users,
} from 'meteor/idreesia-common/server/collections/admin';

import { People } from 'meteor/idreesia-common/server/collections/common';

import { findUsersByPersonIds, mapUser } from './map-user';
import { buildUserSearchPipeline, searchUsers } from './search-users';

const insertUser = (username: string, fields: Record<string, unknown> = {}) =>
  Users.insertAsync({ _id: username, username, ...fields });

const names = async (params: Record<string, unknown>) =>
  (await searchUsers(params)).data.map(user => user.username);

describe('buildUserSearchPipeline', () => {
  const regularUsersOnly = { $match: { isServiceAccount: { $ne: true } } };

  it('only keeps regular users without other filters', () => {
    expect(buildUserSearchPipeline({})).toEqual([regularUsersOnly]);
    expect(
      buildUserSearchPipeline({ showLocked: 'true', showUnlocked: 'true' })
    ).toEqual([regularUsersOnly]);
  });

  it('keeps only service accounts when asked', () => {
    expect(buildUserSearchPipeline({ serviceAccounts: 'true' })).toEqual([
      { $match: { isServiceAccount: { $eq: true } } },
    ]);
  });

  it('is null when the filters exclude every user', () => {
    expect(
      buildUserSearchPipeline({ showLocked: 'false', showUnlocked: 'false' })
    ).toBeNull();
    expect(
      buildUserSearchPipeline({ showActive: 'false', showInactive: 'false' })
    ).toBeNull();
  });

  it('matches the module as a kebab-case permission prefix', () => {
    expect(buildUserSearchPipeline({ moduleAccess: 'Security Server' })).toEqual([
      regularUsersOnly,
      expect.objectContaining({ $lookup: expect.objectContaining({ from: 'user-groups' }) }),
      {
        $match: {
          $or: [
            { permissions: { $elemMatch: { $regex: '^security-server' } } },
            { 'groupDocs.permissions': { $elemMatch: { $regex: '^security-server' } } },
          ],
        },
      },
      { $project: { groupDocs: 0 } },
    ]);
  });
});

describe('searchUsers', () => {
  it('returns nothing, without querying, for impossible filters', async () => {
    await insertUser('ali');
    expect(
      await searchUsers({ showLocked: 'false', showUnlocked: 'false' })
    ).toEqual({ data: [], totalResults: 0 });
  });

  it('filters by locked state', async () => {
    await insertUser('open');
    await insertUser('shut', { locked: true });

    expect(await names({ showLocked: 'true', showUnlocked: 'false' })).toEqual([
      'shut',
    ]);
    expect(await names({ showLocked: 'false', showUnlocked: 'true' })).toEqual([
      'open',
    ]);
    expect(await names({ showLocked: 'true', showUnlocked: 'true' })).toEqual([
      'open',
      'shut',
    ]);
  });

  it('filters by activity in the last three minutes', async () => {
    await insertUser('now', { lastActiveAt: new Date() });
    await insertUser('stale', { lastActiveAt: subMinutes(new Date(), 10) });
    await insertUser('never');

    expect(await names({ showActive: 'true', showInactive: 'false' })).toEqual([
      'now',
    ]);
    expect(await names({ showActive: 'false', showInactive: 'true' })).toEqual([
      'never',
      'stale',
    ]);
  });

  it('lists service accounts apart from regular users', async () => {
    await insertUser('human');
    await insertUser('robot', { isServiceAccount: true });

    expect(await names({})).toEqual(['human']);
    expect(await names({ serviceAccounts: 'true' })).toEqual(['robot']);
  });

  it('filters by module access', async () => {
    await insertUser('hr1', { permissions: ['hr-view-karkuns'] });
    await insertUser('sec', { permissions: ['security-view'] });
    await insertUser('none');

    expect(await names({ moduleAccess: 'HR' })).toEqual(['hr1']);
  });

  it('includes users who get module access from a group', async () => {
    const groupId = await UserGroups.insertAsync({
      name: 'hr-team',
      permissions: ['hr-view'],
    } as never);
    await insertUser('direct', { permissions: ['hr-view'] });
    await insertUser('viaGroup', { groups: [groupId] });
    await insertUser('none');

    expect((await names({ moduleAccess: 'HR' })).sort()).toEqual(['direct', 'viaGroup']);
  });

  it('filters by part of the user name or the display name, ignoring case', async () => {
    await insertUser('ali.khan', { profile: { name: 'Ali Khan' } });
    await insertUser('bo', { profile: { name: 'Bilal Aslam' } });
    await insertUser('cy');

    expect(await names({ name: 'ALI' })).toEqual(['ali.khan']);
    expect(await names({ name: 'aslam' })).toEqual(['bo']);
    expect(await names({ name: 'a.b' })).toEqual([]); // Not a pattern.
  });

  it('filters by the city or mehfil of the person the user is linked to', async () => {
    const insertPerson = (_id: string, karkunData: Record<string, unknown>) =>
      People.insertAsync({ _id, isKarkun: true, karkunData } as never);
    await insertPerson('p1', { cityLocationId: 'c1', mehfilLocationId: 'm1' });
    await insertPerson('p2', { cityLocationId: 'c1', mehfilLocationId: 'm2' });
    await insertPerson('p3', { cityLocationId: 'c2' });
    await insertUser('u1', { personId: 'p1' });
    await insertUser('u2', { personId: 'p2' });
    await insertUser('u3', { personId: 'p3' });
    await insertUser('unlinked');

    expect((await names({ cityLocationId: 'c1' })).sort()).toEqual(['u1', 'u2']);
    expect(await names({ mehfilLocationId: 'm2' })).toEqual(['u2']);
    expect(await names({ cityLocationId: 'c2' })).toEqual(['u3']);
  });

  it('pages users sorted by user name, with a total count', async () => {
    for (const name of ['c', 'a', 'b']) await insertUser(name);

    const page = await searchUsers({ pageIndex: '1', pageSize: '2' });
    expect(page.totalResults).toBe(3);
    expect(page.data.map(user => user.username)).toEqual(['c']);
  });

  it('maps users to the exposed fields only', async () => {
    await insertUser('ali', {
      emails: [{ address: 'a@b.c', verified: true }],
      profile: { name: 'Ali' },
      services: { password: { bcrypt: 'secret-hash' } },
    });
    const [user] = (await searchUsers({})).data;
    expect(user).toMatchObject({
      email: 'a@b.c',
      emailVerified: true,
      displayName: 'Ali',
      permissions: [],
      instances: [],
      groups: [],
      twoFactorEnabled: false,
      isSuperAdmin: false,
    });
    expect(JSON.stringify(user)).not.toContain('secret-hash');
  });
});

describe('mapUser', () => {
  it('defaults missing fields', () => {
    expect(mapUser({ _id: 'u' })).toMatchObject({
      email: null,
      emailVerified: false,
      permissions: [],
      isSuperAdmin: false,
    });
  });

  it('only reports a super admin for an exact true flag', () => {
    expect(mapUser({ _id: 'u', isSuperAdmin: true }).isSuperAdmin).toBe(true);
  });
});

describe('findUsersByPersonIds', () => {
  it('finds the accounts linked to the people', async () => {
    await insertUser('a', { personId: 'p1' });
    await insertUser('b', { personId: 'p2' });
    await insertUser('c');
    const users = await findUsersByPersonIds(['p1', 'p3']);
    expect(users.map(user => user.username)).toEqual(['a']);
  });
});
