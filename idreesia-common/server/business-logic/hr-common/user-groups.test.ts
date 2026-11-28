import { describe, expect, it } from 'vitest';

import { ModuleNames } from 'meteor/idreesia-common/constants';
import { UserGroups, Users } from 'meteor/idreesia-common/server/collections/admin';
import { People, SecurityLogs } from 'meteor/idreesia-common/server/collections/common';
import { Permissions } from 'meteor/idreesia-common/constants';

import { listPermissionAssignments } from './permissions';
import { HR_EMPLOYEES_MODULE, HR_KARKUNS_MODULE } from './hr-modules';
import {
  addGroupMember,
  addGroupPermission,
  removeGroupPermission,
  createUserGroup,
  deleteUserGroup,
  listUserGroups,
  removeGroupMember,
  updateUserGroup,
} from './user-groups';

const admin = { _id: 'admin' };
const scope = HR_KARKUNS_MODULE;

describe('hr user groups', () => {
  it('creates an HR group and lists it with its members', async () => {
    const group = await createUserGroup(scope, { name: '  Viewers ', description: 'See karkuns' }, admin);
    expect(group).toMatchObject({ name: 'Viewers', moduleName: ModuleNames.hrKarkuns });

    await Users.insertAsync({ _id: 'u1', personId: 'p1', username: 'ali', profile: { name: 'Ali' } } as any);
    await addGroupMember(scope, group!._id!, 'p1');
    // Adding twice keeps one membership.
    await addGroupMember(scope, group!._id!, 'p1');
    expect((await Users.findOneAsync('u1'))?.groups).toEqual([group!._id]);

    const listed = await listUserGroups(scope);
    expect(listed).toHaveLength(1);
    expect(listed[0].users).toEqual([{ userId: 'u1', personId: 'p1', username: 'ali', displayName: 'Ali' }]);

    await removeGroupMember(scope, group!._id!, 'u1');
    expect((await Users.findOneAsync('u1'))?.groups).toEqual([]);
  });

  it('rejects a blank name and a duplicate name, ignoring case', async () => {
    await createUserGroup(scope, { name: 'Viewers' }, admin);
    await expect(createUserGroup(scope, { name: '  ' }, admin)).rejects.toMatchObject({
      extensions: { code: 'BAD_USER_INPUT' },
    });
    await expect(createUserGroup(scope, { name: 'viewers' }, admin)).rejects.toMatchObject({
      extensions: { code: 'CONFLICT' },
    });
  });

  it('renames a group, keeps its own name allowed, and clears the description', async () => {
    const group = await createUserGroup(scope, { name: 'Viewers', description: 'x' }, admin);
    const updated = await updateUserGroup(scope, { _id: group!._id!, name: 'Viewers', description: '' }, admin);
    expect(updated?.description).toBeUndefined();
    const renamed = await updateUserGroup(scope, { _id: group!._id!, name: 'Approvers' }, admin);
    expect(renamed?.name).toBe('Approvers');
  });

  it('will not touch a group of another module', async () => {
    const otherId = await UserGroups.insertAsync({ name: 'Store keepers', moduleName: ModuleNames.stores } as any);
    await Users.insertAsync({ _id: 'u2', personId: 'p2', username: 'bo' } as any);
    await expect(addGroupMember(scope, otherId, 'p2')).rejects.toMatchObject({ extensions: { code: 'NOT_FOUND' } });
    await expect(deleteUserGroup(scope, otherId)).rejects.toMatchObject({ extensions: { code: 'NOT_FOUND' } });
    await expect(updateUserGroup(scope, { _id: otherId, name: 'X' }, admin)).rejects.toMatchObject({
      extensions: { code: 'NOT_FOUND' },
    });
    expect(await listUserGroups(scope)).toEqual([]);
  });

  it('deletes only an empty group', async () => {
    const group = await createUserGroup(scope, { name: 'Viewers' }, admin);
    await Users.insertAsync({ _id: 'u3', personId: 'p3', username: 'cy' } as any);
    await addGroupMember(scope, group!._id!, 'p3');
    await expect(deleteUserGroup(scope, group!._id!)).rejects.toMatchObject({ extensions: { code: 'CONFLICT' } });
    await removeGroupMember(scope, group!._id!, 'u3');
    await deleteUserGroup(scope, group!._id!);
    expect(await listUserGroups(scope)).toEqual([]);
  });

  it('shows the karkun’s name when the account has none', async () => {
    const group = await createUserGroup(scope, { name: 'Viewers' }, admin);
    await (People.rawCollection() as any).insertOne({ _id: 'pn', sharedData: { name: 'Nadia' } });
    await Users.insertAsync({ _id: 'un', personId: 'pn', username: 'nad' } as any);
    await addGroupMember(scope, group!._id!, 'pn');
    expect((await listUserGroups(scope))[0].users[0].displayName).toBe('Nadia');
  });

  it('refuses a karkun without an account and a locked account', async () => {
    const group = await createUserGroup(scope, { name: 'Viewers' }, admin);
    await expect(addGroupMember(scope, group!._id!, 'nobody')).rejects.toMatchObject({
      extensions: { code: 'NOT_FOUND' },
    });
    await Users.insertAsync({ _id: 'lk', personId: 'plk', username: 'lock', locked: true } as any);
    await expect(addGroupMember(scope, group!._id!, 'plk')).rejects.toMatchObject({
      extensions: { code: 'BAD_USER_INPUT' },
    });
  });

  it('gives a permission to a group, lists it on the permission, and takes it away', async () => {
    const group = await createUserGroup(scope, { name: 'Viewers' }, admin);
    const key = Permissions.HR_VIEW_KARKUNS;
    const holders = async () =>
      (await listPermissionAssignments(scope)).flatMap((g) => g.permissions).find((p) => p.key === key)!.groups;

    await addGroupPermission(scope, group!._id!, key, admin);
    await addGroupPermission(scope, group!._id!, key, admin); // Twice: no change, one log.
    expect((await UserGroups.findOneAsync(group!._id!))?.permissions).toEqual([key]);
    expect(await holders()).toEqual([{ groupId: group!._id, name: 'Viewers' }]);
    expect(await SecurityLogs.find({ groupId: group!._id }).countAsync()).toBe(1);

    await removeGroupPermission(scope, group!._id!, key, admin);
    expect(await holders()).toEqual([]);
    expect(await SecurityLogs.find({ groupId: group!._id }).countAsync()).toBe(2);
  });

  it('refuses a non-HR permission and a group of another module', async () => {
    const group = await createUserGroup(scope, { name: 'Viewers' }, admin);
    await expect(addGroupPermission(scope, group!._id!, 'admin-manage-cities', admin)).rejects.toMatchObject({
      extensions: { code: 'BAD_USER_INPUT' },
    });
    const otherId = await UserGroups.insertAsync({ name: 'Store keepers', moduleName: ModuleNames.stores } as any);
    await expect(
      addGroupPermission(scope, otherId, Permissions.HR_VIEW_KARKUNS, admin)
    ).rejects.toMatchObject({ extensions: { code: 'NOT_FOUND' } });
  });

  it("keeps each HR module's groups to itself", async () => {
    const karkunsGroup = await createUserGroup(scope, { name: 'Duty Team' }, admin);
    const employeesGroup = await createUserGroup(HR_EMPLOYEES_MODULE, { name: 'Payroll' }, admin);

    expect(employeesGroup?.moduleName).toBe(ModuleNames.hrEmployees);
    expect((await listUserGroups(scope)).map((g) => g.name)).toEqual(['Duty Team']);
    expect((await listUserGroups(HR_EMPLOYEES_MODULE)).map((g) => g.name)).toEqual(['Payroll']);
    await expect(deleteUserGroup(HR_EMPLOYEES_MODULE, karkunsGroup!._id!)).rejects.toMatchObject({
      extensions: { code: 'NOT_FOUND' },
    });
    await expect(
      addGroupPermission(scope, karkunsGroup!._id!, Permissions.HR_VIEW_EMPLOYEES, admin)
    ).rejects.toMatchObject({ extensions: { code: 'BAD_USER_INPUT' } });
  });
});
