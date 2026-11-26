import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DataSource, ModuleNames, Permissions } from 'meteor/idreesia-common/constants';
import { UserGroups, Users } from 'meteor/idreesia-common/server/collections/admin';
import { SecurityLogs } from 'meteor/idreesia-common/server/collections/common';
import {
  PhysicalStoreAccess,
  PhysicalStores,
} from 'meteor/idreesia-common/server/collections/inventory';

import {
  addPhysicalStoreAccessGroup,
  addStoreUserGroupMember,
  createStoreUserGroup,
  deleteStoreUserGroup,
  listStoreUserGroups,
  removeStoreUserGroupMember,
  updateStoreUserGroup,
} from './index';

const admin = { _id: 'admin' };
const VIEW = Permissions.IN_VIEW_ISSUANCE_FORMS;
const PURCHASE = Permissions.IN_VIEW_PURCHASE_FORMS;

let s1: string;
let s2: string;

beforeEach(async () => {
  s1 = await PhysicalStores.insertAsync({ name: 'Store 1' } as any);
  s2 = await PhysicalStores.insertAsync({ name: 'Store 2' } as any);
});

describe('stores user groups', () => {
  it('creates a Stores group and lists it with its members', async () => {
    const group = await createStoreUserGroup(
      { name: '  Store   keepers ', description: 'Issue items' },
      admin
    );
    expect(group).toMatchObject({
      name: 'Store keepers',
      moduleName: ModuleNames.stores,
      description: 'Issue items',
    });

    await Users.insertAsync({
      _id: 'u1',
      personId: 'p1',
      username: 'ali',
      profile: { name: 'Ali' },
    } as any);
    await addStoreUserGroupMember(group!._id!, 'p1');
    // Adding twice keeps one membership.
    await addStoreUserGroupMember(group!._id!, 'p1');
    expect((await Users.findOneAsync('u1'))?.groups).toEqual([group!._id]);

    expect(await listStoreUserGroups()).toEqual([
      {
        _id: group!._id,
        name: 'Store keepers',
        description: 'Issue items',
        users: [{ userId: 'u1', personId: 'p1', username: 'ali', displayName: 'Ali' }],
      },
    ]);

    await removeStoreUserGroupMember(group!._id!, 'u1');
    expect((await Users.findOneAsync('u1'))?.groups).toEqual([]);
  });

  it('lists only the groups of the Stores module', async () => {
    await UserGroups.insertAsync({ name: 'HR Viewers', moduleName: ModuleNames.hr } as any);
    await createStoreUserGroup({ name: 'Store keepers' }, admin);
    expect((await listStoreUserGroups()).map(group => group.name)).toEqual([
      'Store keepers',
    ]);
  });

  it('rejects a blank name and a name already used', async () => {
    await expect(createStoreUserGroup({ name: '   ' }, admin)).rejects.toMatchObject({
      extensions: { code: 'BAD_USER_INPUT' },
    });

    await UserGroups.insertAsync({ name: 'HR Viewers', moduleName: ModuleNames.hr } as any);
    await expect(
      createStoreUserGroup({ name: 'hr viewers' }, admin)
    ).rejects.toMatchObject({ extensions: { code: 'CONFLICT' } });
  });

  it('renames a group and clears its description', async () => {
    const group = await createStoreUserGroup({ name: 'A', description: 'x' }, admin);
    const updated = await updateStoreUserGroup(
      { _id: group!._id!, name: 'B', description: '' },
      admin
    );
    expect(updated?.name).toBe('B');
    expect(updated?.description).toBeUndefined();
  });

  it('will not touch a group of another module', async () => {
    const hrGroupId = await UserGroups.insertAsync({
      name: 'HR',
      moduleName: ModuleNames.hr,
    } as any);
    await Users.insertAsync({ _id: 'u1', personId: 'p1' } as any);

    await expect(
      updateStoreUserGroup({ _id: hrGroupId, name: 'X' }, admin)
    ).rejects.toMatchObject({ extensions: { code: 'NOT_FOUND' } });
    await expect(addStoreUserGroupMember(hrGroupId, 'p1')).rejects.toMatchObject({
      extensions: { code: 'NOT_FOUND' },
    });
    await expect(
      deleteStoreUserGroup(hrGroupId, admin, DataSource.ADMIN)
    ).rejects.toMatchObject({ extensions: { code: 'NOT_FOUND' } });
  });

  it('refuses a karkun without an unlocked user account', async () => {
    const group = await createStoreUserGroup({ name: 'A' }, admin);
    await expect(addStoreUserGroupMember(group!._id!, 'nobody')).rejects.toMatchObject({
      extensions: { code: 'NOT_FOUND' },
    });
    await Users.insertAsync({ _id: 'u1', personId: 'p1', locked: true } as any);
    await expect(addStoreUserGroupMember(group!._id!, 'p1')).rejects.toMatchObject({
      extensions: { code: 'BAD_USER_INPUT' },
    });
  });

  it('deletes an empty group and takes its permissions on every store', async () => {
    const group = await createStoreUserGroup({ name: 'A' }, admin);
    const groupId = group!._id!;
    await addPhysicalStoreAccessGroup(
      { physicalStoreId: s1, permission: VIEW, groupId },
      admin,
      DataSource.ADMIN
    );
    await addPhysicalStoreAccessGroup(
      { physicalStoreId: s2, permission: PURCHASE, groupId },
      admin,
      DataSource.ADMIN
    );

    await Users.insertAsync({ _id: 'u1', personId: 'p1' } as any);
    await addStoreUserGroupMember(groupId, 'p1');
    await expect(
      deleteStoreUserGroup(groupId, admin, DataSource.ADMIN)
    ).rejects.toMatchObject({ extensions: { code: 'CONFLICT' } });

    await removeStoreUserGroupMember(groupId, 'u1');
    await deleteStoreUserGroup(groupId, admin, DataSource.ADMIN);
    expect(await UserGroups.findOneAsync(groupId)).toBeUndefined();
    expect(await PhysicalStoreAccess.find({ subjectId: groupId }).countAsync()).toBe(0);
    expect(
      await SecurityLogs.find({
        groupId,
        'operationDetails.permissionsRemoved': { $exists: true },
      }).countAsync()
    ).toBe(2);
  });

  it('keeps the group and its access when the delete fails part-way', async () => {
    const group = await createStoreUserGroup({ name: 'A' }, admin);
    const groupId = group!._id!;
    await addPhysicalStoreAccessGroup(
      { physicalStoreId: s1, permission: VIEW, groupId },
      admin,
      DataSource.ADMIN
    );
    vi.spyOn(UserGroups, 'removeAsync').mockRejectedValueOnce(new Error('boom'));

    await expect(deleteStoreUserGroup(groupId, admin, DataSource.ADMIN)).rejects.toThrow(
      'boom'
    );
    expect(await UserGroups.findOneAsync(groupId)).toBeTruthy();
    expect(await PhysicalStoreAccess.find({ subjectId: groupId }).countAsync()).toBe(1);
  });
});
