import { describe, expect, it } from 'vitest';

import { ModuleNames } from 'meteor/idreesia-common/constants';
import { UserGroups, Users } from 'meteor/idreesia-common/server/collections/admin';
import { People, SecurityLogs } from 'meteor/idreesia-common/server/collections/common';
import { Permissions } from 'meteor/idreesia-common/constants';

import { listPermissionAssignments } from './permissions';
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

describe('hr user groups', () => {
  it('creates a Security group and lists it with its members', async () => {
    const group = await createUserGroup({ name: '  Viewers ', description: 'See karkuns' }, admin);
    expect(group).toMatchObject({ name: 'Viewers', moduleName: ModuleNames.security });

    await Users.insertAsync({ _id: 'u1', personId: 'p1', username: 'ali', profile: { name: 'Ali' } } as any);
    await addGroupMember(group!._id!, 'p1');
    // Adding twice keeps one membership.
    await addGroupMember(group!._id!, 'p1');
    expect((await Users.findOneAsync('u1'))?.groups).toEqual([group!._id]);

    const listed = await listUserGroups();
    expect(listed).toHaveLength(1);
    expect(listed[0].users).toEqual([{ userId: 'u1', personId: 'p1', username: 'ali', displayName: 'Ali' }]);

    await removeGroupMember(group!._id!, 'u1');
    expect((await Users.findOneAsync('u1'))?.groups).toEqual([]);
  });

  it('rejects a blank name and a duplicate name, ignoring case', async () => {
    await createUserGroup({ name: 'Viewers' }, admin);
    await expect(createUserGroup({ name: '  ' }, admin)).rejects.toMatchObject({
      extensions: { code: 'BAD_USER_INPUT' },
    });
    await expect(createUserGroup({ name: 'viewers' }, admin)).rejects.toMatchObject({
      extensions: { code: 'CONFLICT' },
    });
  });

  it('renames a group, keeps its own name allowed, and clears the description', async () => {
    const group = await createUserGroup({ name: 'Viewers', description: 'x' }, admin);
    const updated = await updateUserGroup({ _id: group!._id!, name: 'Viewers', description: '' }, admin);
    expect(updated?.description).toBeUndefined();
    const renamed = await updateUserGroup({ _id: group!._id!, name: 'Approvers' }, admin);
    expect(renamed?.name).toBe('Approvers');
  });

  it('will not touch a group of another module', async () => {
    const otherId = await UserGroups.insertAsync({ name: 'Store keepers', moduleName: ModuleNames.stores } as any);
    await Users.insertAsync({ _id: 'u2', personId: 'p2', username: 'bo' } as any);
    await expect(addGroupMember(otherId, 'p2')).rejects.toMatchObject({ extensions: { code: 'NOT_FOUND' } });
    await expect(deleteUserGroup(otherId)).rejects.toMatchObject({ extensions: { code: 'NOT_FOUND' } });
    await expect(updateUserGroup({ _id: otherId, name: 'X' }, admin)).rejects.toMatchObject({
      extensions: { code: 'NOT_FOUND' },
    });
    expect(await listUserGroups()).toEqual([]);
  });

  it('deletes only an empty group', async () => {
    const group = await createUserGroup({ name: 'Viewers' }, admin);
    await Users.insertAsync({ _id: 'u3', personId: 'p3', username: 'cy' } as any);
    await addGroupMember(group!._id!, 'p3');
    await expect(deleteUserGroup(group!._id!)).rejects.toMatchObject({ extensions: { code: 'CONFLICT' } });
    await removeGroupMember(group!._id!, 'u3');
    await deleteUserGroup(group!._id!);
    expect(await listUserGroups()).toEqual([]);
  });

  it('shows the karkun’s name when the account has none', async () => {
    const group = await createUserGroup({ name: 'Viewers' }, admin);
    await (People.rawCollection() as any).insertOne({ _id: 'pn', sharedData: { name: 'Nadia' } });
    await Users.insertAsync({ _id: 'un', personId: 'pn', username: 'nad' } as any);
    await addGroupMember(group!._id!, 'pn');
    expect((await listUserGroups())[0].users[0].displayName).toBe('Nadia');
  });

  it('refuses a karkun without an account and a locked account', async () => {
    const group = await createUserGroup({ name: 'Viewers' }, admin);
    await expect(addGroupMember(group!._id!, 'nobody')).rejects.toMatchObject({
      extensions: { code: 'NOT_FOUND' },
    });
    await Users.insertAsync({ _id: 'lk', personId: 'plk', username: 'lock', locked: true } as any);
    await expect(addGroupMember(group!._id!, 'plk')).rejects.toMatchObject({
      extensions: { code: 'BAD_USER_INPUT' },
    });
  });

  it('gives a permission to a group, lists it on the permission, and takes it away', async () => {
    const group = await createUserGroup({ name: 'Viewers' }, admin);
    const key = Permissions.SECURITY_VIEW_VISITORS;
    const holders = async () =>
      (await listPermissionAssignments()).flatMap((g) => g.permissions).find((p) => p.key === key)!.groups;

    await addGroupPermission(group!._id!, key, admin);
    await addGroupPermission(group!._id!, key, admin); // Twice: no change, one log.
    expect((await UserGroups.findOneAsync(group!._id!))?.permissions).toEqual([key]);
    expect(await holders()).toEqual([{ groupId: group!._id, name: 'Viewers' }]);
    expect(await SecurityLogs.find({ groupId: group!._id }).countAsync()).toBe(1);

    await removeGroupPermission(group!._id!, key, admin);
    expect(await holders()).toEqual([]);
    expect(await SecurityLogs.find({ groupId: group!._id }).countAsync()).toBe(2);
  });

  it('refuses a non-Security permission and a group of another module', async () => {
    const group = await createUserGroup({ name: 'Viewers' }, admin);
    await expect(addGroupPermission(group!._id!, 'admin-manage-cities', admin)).rejects.toMatchObject({
      extensions: { code: 'BAD_USER_INPUT' },
    });
    const otherId = await UserGroups.insertAsync({ name: 'Store keepers', moduleName: ModuleNames.stores } as any);
    await expect(
      addGroupPermission(otherId, Permissions.SECURITY_VIEW_VISITORS, admin)
    ).rejects.toMatchObject({ extensions: { code: 'NOT_FOUND' } });
  });
});
