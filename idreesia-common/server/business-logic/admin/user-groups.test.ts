import { describe, expect, it, vi } from 'vitest';

import { SecurityOperationType } from 'meteor/idreesia-common/constants/audit';
import {
  UserGroups,
  Users,
} from 'meteor/idreesia-common/server/collections/admin';
import {
  People,
  SecurityLogs,
} from 'meteor/idreesia-common/server/collections/common';

import {
  createUserGroup,
  listUserGroupMembers,
  removeUserGroup,
  searchUserGroups,
  setUserGroupPermissions,
  updateUserGroup,
} from './user-groups';

const user = { _id: 'u1' };

describe('createUserGroup', () => {
  it('stamps the creator and returns the group', async () => {
    const group = await createUserGroup(
      { name: 'Admins', moduleName: 'hr', description: 'desc' },
      user
    );
    expect(group).toMatchObject({
      name: 'Admins',
      moduleName: 'hr',
      description: 'desc',
      createdBy: 'u1',
      updatedBy: 'u1',
    });
  });

  it('rejects a name that is already in use', async () => {
    await createUserGroup({ name: 'Admins' }, user);
    await expect(createUserGroup({ name: 'Admins' }, user)).rejects.toThrow(
      "User Group name 'Admins' is already in use."
    );
    expect(await UserGroups.find().countAsync()).toBe(1);
  });
});

describe('updateUserGroup', () => {
  it('updates the name and description and stamps the updater', async () => {
    const group = await createUserGroup({ name: 'Old' }, user);
    const updated = await updateUserGroup(
      { _id: group!._id!, name: 'New', description: 'd' },
      { _id: 'u2' }
    );
    expect(updated).toMatchObject({
      name: 'New',
      description: 'd',
      updatedBy: 'u2',
      createdBy: 'u1',
    });
  });
});

describe('removeUserGroup', () => {
  it('deletes an unused group', async () => {
    const group = await createUserGroup({ name: 'Unused' }, user);
    await removeUserGroup({ _id: group!._id! });
    expect(await UserGroups.findOneAsync(group!._id!)).toBeUndefined();
  });

  it('refuses to delete a group that users still belong to', async () => {
    const group = await createUserGroup({ name: 'Used' }, user);
    await Users.insertAsync({ _id: 'member', groups: [group!._id!] });

    await expect(removeUserGroup({ _id: group!._id! })).rejects.toThrow(
      'currently in use'
    );
    expect(await UserGroups.findOneAsync(group!._id!)).toBeDefined();
  });
});

describe('setUserGroupPermissions', () => {
  it('saves the permissions and logs what was added and removed', async () => {
    const group = await createUserGroup({ name: 'G' }, user);
    await setUserGroupPermissions(
      { _id: group!._id!, permissions: ['a', 'b'] },
      user,
      'test',
      'detail'
    );
    const updated = await setUserGroupPermissions(
      { _id: group!._id!, permissions: ['b', 'c'] },
      user,
      'test'
    );
    expect(updated?.permissions).toEqual(['b', 'c']);

    const logs = await SecurityLogs.find(
      { groupId: group!._id! },
      { sort: { operationTime: 1 } }
    ).fetchAsync();
    expect(logs).toHaveLength(2);
    expect(logs[0]).toMatchObject({
      operationType: SecurityOperationType.PERMISSIONS_CHANGED,
      operationBy: 'u1',
      dataSource: 'test',
      dataSourceDetail: 'detail',
      operationDetails: { permissionsAdded: ['a', 'b'], permissionsRemoved: [] },
    });
    expect(logs[1].operationDetails).toEqual({
      permissionsAdded: ['c'],
      permissionsRemoved: ['a'],
    });
  });

  it('rolls the permissions back when the security log cannot be written', async () => {
    const group = await createUserGroup({ name: 'G' }, user);
    await setUserGroupPermissions(
      { _id: group!._id!, permissions: ['a'] },
      user,
      'test'
    );
    vi.spyOn(SecurityLogs, 'insertAsync').mockRejectedValueOnce(
      new Error('boom')
    );

    await expect(
      setUserGroupPermissions(
        { _id: group!._id!, permissions: ['a', 'b'] },
        user,
        'test'
      )
    ).rejects.toThrow('boom');
    expect((await UserGroups.findOneAsync(group!._id!))?.permissions).toEqual([
      'a',
    ]);
    expect(await SecurityLogs.find().countAsync()).toBe(1);
  });
});

describe('searchUserGroups', () => {
  it('pages groups sorted by name with a total count', async () => {
    for (const name of ['C', 'A', 'B']) {
      await createUserGroup({ name }, user);
    }
    const page = await searchUserGroups('pageIndex=1&pageSize=2');
    expect(page.totalResults).toBe(3);
    expect(page.data.map(group => group.name)).toEqual(['C']);

    const first = await searchUserGroups('pageSize=2');
    expect(first.data.map(group => group.name)).toEqual(['A', 'B']);
  });

  it('filters by module', async () => {
    await createUserGroup({ name: 'A', moduleName: 'Purchasing' }, user);
    await createUserGroup({ name: 'B', moduleName: 'HR' }, user);
    const result = await searchUserGroups('moduleName=HR');
    expect(result.data.map(group => group.name)).toEqual(['B']);
    expect(result.totalResults).toBe(1);
  });

  it('filters by a user, to the groups that user belongs to', async () => {
    const a = await createUserGroup({ name: 'A' }, user);
    await createUserGroup({ name: 'B' }, user);
    const c = await createUserGroup({ name: 'C' }, user);
    await Users.insertAsync({ _id: 'm1', username: 'm1', groups: [a!._id!, c!._id!] });
    await Users.insertAsync({ _id: 'm2', username: 'm2' });

    const result = await searchUserGroups('userId=m1');
    expect(result.data.map(group => group.name)).toEqual(['A', 'C']);
    expect(result.totalResults).toBe(2);
    expect((await searchUserGroups('userId=m2')).data).toEqual([]);
    expect((await searchUserGroups('userId=nobody')).data).toEqual([]);
  });

  it('combines the module and user filters', async () => {
    const a = await createUserGroup({ name: 'A', moduleName: 'Purchasing' }, user);
    const b = await createUserGroup({ name: 'B', moduleName: 'HR' }, user);
    await Users.insertAsync({ _id: 'm1', username: 'm1', groups: [a!._id!, b!._id!] });
    const result = await searchUserGroups('moduleName=HR&userId=m1');
    expect(result.data.map(group => group.name)).toEqual(['B']);
  });

  it('reports zero results for no groups', async () => {
    expect(await searchUserGroups('')).toEqual({ data: [], totalResults: 0 });
  });
});

describe('listUserGroupMembers', () => {
  it('lists the group users by user name, with the account name or else the karkun name', async () => {
    const group = await createUserGroup({ name: 'A' }, user);
    const other = await createUserGroup({ name: 'B' }, user);
    await (People.rawCollection() as any).insertOne({
      _id: 'p2',
      sharedData: { name: 'Karkun Two' },
    });
    await Users.insertAsync({
      _id: 'u-a',
      username: 'a',
      profile: { name: 'Account A' },
      groups: [group!._id!],
    });
    await Users.insertAsync({
      _id: 'u-b',
      username: 'b',
      personId: 'p2',
      groups: [group!._id!],
    });
    await Users.insertAsync({ _id: 'u-c', username: 'c', groups: [other!._id!] });

    expect(await listUserGroupMembers(group!._id!)).toEqual([
      { userId: 'u-a', personId: undefined, username: 'a', displayName: 'Account A' },
      { userId: 'u-b', personId: 'p2', username: 'b', displayName: 'Karkun Two' },
    ]);
    expect(await listUserGroupMembers('none')).toEqual([]);
  });
});
