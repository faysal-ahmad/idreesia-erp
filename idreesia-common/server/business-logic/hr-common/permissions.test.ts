import { describe, expect, it } from 'vitest';

import { Permissions } from 'meteor/idreesia-common/constants';
import { UserGroups, Users } from 'meteor/idreesia-common/server/collections/admin';
import { People, SecurityLogs } from 'meteor/idreesia-common/server/collections/common';

import {
  addPermissionUser,
  listPermissionAssignments,
  removePermissionUser,
} from './permissions';
import { HR_EMPLOYEES_MODULE, HR_KARKUNS_MODULE } from './hr-modules';

const admin = { _id: 'admin' };
const scope = HR_KARKUNS_MODULE;
const KEY = Permissions.HR_VIEW_KARKUNS;

const holdersOf = async (key: string) => {
  const groups = await listPermissionAssignments(scope);
  return groups.flatMap((g) => g.permissions).find((p) => p.key === key)!.users;
};

describe('hr permission assignments', () => {
  it('does not list users who only hold a permission through a group', async () => {
    const groupId = await UserGroups.insertAsync({ name: 'viewers', permissions: [KEY] } as any);
    await Users.insertAsync({ _id: 'member', username: 'mem', groups: [groupId] } as any);
    await Users.insertAsync({ _id: 'locked', username: 'lk', locked: true, groups: [groupId] } as any);
    await Users.insertAsync({ _id: 'other', username: 'oth' } as any);

    expect((await holdersOf(KEY)).map((u) => u.userId)).toEqual([]);
  });

  it('adds and removes a user directly, and logs each change', async () => {
    await Users.insertAsync({ _id: 'u1', personId: 'p1', username: 'ali', profile: { name: 'Ali' } } as any);

    await addPermissionUser(scope, KEY, 'p1', admin);
    expect((await Users.findOneAsync('u1'))?.permissions).toEqual([KEY]);
    expect(await holdersOf(KEY)).toEqual([
      { userId: 'u1', personId: 'p1', username: 'ali', displayName: 'Ali' },
    ]);

    // Adding twice changes nothing and logs nothing more.
    await addPermissionUser(scope, KEY, 'p1', admin);
    expect(await SecurityLogs.find({ userId: 'u1' }).countAsync()).toBe(1);

    await removePermissionUser(scope, KEY, 'u1', admin);
    expect((await Users.findOneAsync('u1'))?.permissions).toEqual([]);
    expect(await SecurityLogs.find({ userId: 'u1' }).countAsync()).toBe(2);
  });

  it('keeps the user’s other permissions', async () => {
    await Users.insertAsync({ _id: 'u2', personId: 'p2', username: 'bo', permissions: ['stores-manage-stock-items'] } as any);
    await addPermissionUser(scope, KEY, 'p2', admin);
    await removePermissionUser(scope, KEY, 'u2', admin);
    expect((await Users.findOneAsync('u2'))?.permissions).toEqual(['stores-manage-stock-items']);
  });

  it('refuses a permission that is not an HR one', async () => {
    await Users.insertAsync({ _id: 'u3', personId: 'p3', username: 'cy' } as any);
    await expect(addPermissionUser(scope, 'admin-manage-cities', 'p3', admin)).rejects.toMatchObject({
      extensions: { code: 'BAD_USER_INPUT' },
    });
  });

  it('refuses a karkun without an account, a locked account and a super admin', async () => {
    await expect(addPermissionUser(scope, KEY, 'nobody', admin)).rejects.toMatchObject({
      extensions: { code: 'NOT_FOUND' },
    });
    await Users.insertAsync({ _id: 'lk', personId: 'plk', username: 'lock', locked: true } as any);
    await expect(addPermissionUser(scope, KEY, 'plk', admin)).rejects.toMatchObject({
      extensions: { code: 'BAD_USER_INPUT' },
    });
    await Users.insertAsync({ _id: 'sa', personId: 'psa', username: 'root', isSuperAdmin: true } as any);
    await expect(addPermissionUser(scope, KEY, 'psa', admin)).rejects.toMatchObject({
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

  it("refuses the other HR module's permissions", async () => {
    await Users.insertAsync({ _id: 'u4', personId: 'p4', username: 'dee' } as any);
    await expect(
      addPermissionUser(scope, Permissions.HR_VIEW_EMPLOYEES, 'p4', admin)
    ).rejects.toMatchObject({ extensions: { code: 'BAD_USER_INPUT' } });
    await expect(
      addPermissionUser(HR_EMPLOYEES_MODULE, Permissions.HR_VIEW_KARKUNS, 'p4', admin)
    ).rejects.toMatchObject({ extensions: { code: 'BAD_USER_INPUT' } });
  });

  it("lists only the module's own permissions", async () => {
    const keys = async (moduleScope: typeof scope) =>
      (await listPermissionAssignments(moduleScope)).flatMap((g) => g.permissions).map((p) => p.key);

    expect(await keys(scope)).toContain(Permissions.HR_VIEW_KARKUNS);
    expect(await keys(scope)).not.toContain(Permissions.HR_VIEW_EMPLOYEES);
    expect(await keys(HR_EMPLOYEES_MODULE)).toContain(Permissions.HR_APPROVE_LEAVES);
    expect(await keys(HR_EMPLOYEES_MODULE)).not.toContain(Permissions.HR_MANAGE_KARKUNS);
  });
});
