import { describe, expect, it } from 'vitest';

import { Permissions } from 'meteor/idreesia-common/constants';
import { UserGroups, Users } from 'meteor/idreesia-common/server/collections/admin';
import { People, SecurityLogs } from 'meteor/idreesia-common/server/collections/common';

import {
  addPermissionUser,
  listPermissionAssignments,
  removePermissionUser,
} from './permissions';

const admin = { _id: 'admin' };
const KEY = Permissions.SECURITY_VIEW_VISITORS;

const holdersOf = async (key: string) => {
  const groups = await listPermissionAssignments();
  return groups.flatMap((g) => g.permissions).find((p) => p.key === key)!.users;
};

describe('hr permission assignments', () => {
  it('lists users who hold a permission through a group', async () => {
    const groupId = await UserGroups.insertAsync({ name: 'viewers', permissions: [KEY] } as any);
    await Users.insertAsync({ _id: 'member', username: 'mem', groups: [groupId] } as any);
    await Users.insertAsync({ _id: 'locked', username: 'lk', locked: true, groups: [groupId] } as any);
    await Users.insertAsync({ _id: 'other', username: 'oth' } as any);

    expect((await holdersOf(KEY)).map((u) => u.userId)).toEqual(['member']);
  });

  it('adds and removes a user directly, and logs each change', async () => {
    await Users.insertAsync({ _id: 'u1', personId: 'p1', username: 'ali', profile: { name: 'Ali' } } as any);

    await addPermissionUser(KEY, 'p1', admin);
    expect((await Users.findOneAsync('u1'))?.permissions).toEqual([KEY]);
    expect(await holdersOf(KEY)).toEqual([
      { userId: 'u1', personId: 'p1', username: 'ali', displayName: 'Ali' },
    ]);

    // Adding twice changes nothing and logs nothing more.
    await addPermissionUser(KEY, 'p1', admin);
    expect(await SecurityLogs.find({ userId: 'u1' }).countAsync()).toBe(1);

    await removePermissionUser(KEY, 'u1', admin);
    expect((await Users.findOneAsync('u1'))?.permissions).toEqual([]);
    expect(await SecurityLogs.find({ userId: 'u1' }).countAsync()).toBe(2);
  });

  it('keeps the user’s other permissions', async () => {
    await Users.insertAsync({ _id: 'u2', personId: 'p2', username: 'bo', permissions: ['stores-manage-stock-items'] } as any);
    await addPermissionUser(KEY, 'p2', admin);
    await removePermissionUser(KEY, 'u2', admin);
    expect((await Users.findOneAsync('u2'))?.permissions).toEqual(['stores-manage-stock-items']);
  });

  it('refuses a permission that is not a Security one', async () => {
    await Users.insertAsync({ _id: 'u3', personId: 'p3', username: 'cy' } as any);
    await expect(addPermissionUser('admin-manage-cities', 'p3', admin)).rejects.toMatchObject({
      extensions: { code: 'BAD_USER_INPUT' },
    });
  });

  it('refuses a karkun without an account, a locked account and a super admin', async () => {
    await expect(addPermissionUser(KEY, 'nobody', admin)).rejects.toMatchObject({
      extensions: { code: 'NOT_FOUND' },
    });
    await Users.insertAsync({ _id: 'lk', personId: 'plk', username: 'lock', locked: true } as any);
    await expect(addPermissionUser(KEY, 'plk', admin)).rejects.toMatchObject({
      extensions: { code: 'BAD_USER_INPUT' },
    });
    await Users.insertAsync({ _id: 'sa', personId: 'psa', username: 'root', isSuperAdmin: true } as any);
    await expect(addPermissionUser(KEY, 'psa', admin)).rejects.toMatchObject({
      extensions: { code: 'BAD_USER_INPUT' },
    });
  });

  it('shows the karkun’s name when the account has none', async () => {
    await (People.rawCollection() as any).insertOne({ _id: 'pn', sharedData: { name: 'Nadia' } });
    await Users.insertAsync({ _id: 'un', personId: 'pn', username: 'nad', permissions: [KEY] } as any);
    expect(await holdersOf(KEY)).toEqual([
      expect.objectContaining({ userId: 'un', displayName: 'Nadia' }),
    ]);
  });

  it('skips locked users', async () => {
    await Users.insertAsync({ _id: 'g3', personId: 'pg3', username: 'fay', permissions: [KEY], locked: true } as any);
    expect(await holdersOf(KEY)).toEqual([]);
  });
});
