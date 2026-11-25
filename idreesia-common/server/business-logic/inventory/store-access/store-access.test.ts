import { beforeEach, describe, expect, it } from 'vitest';

import { Permissions } from 'meteor/idreesia-common/constants';
import { StorePermissionValues } from 'meteor/idreesia-common/constants/stores-permissions';
import { UserGroups, Users } from 'meteor/idreesia-common/server/collections/admin';
import { SecurityLogs } from 'meteor/idreesia-common/server/collections/common';
import {
  PhysicalStoreAccess,
  PhysicalStores,
} from 'meteor/idreesia-common/server/collections/inventory';

import {
  addPhysicalStoreAccessGroup,
  addPhysicalStoreAccessUser,
  filterAccessibleStores,
  hasAnyStorePermission,
  hasStorePermission,
  listPhysicalStoreAccess,
  loadStoreAccessMap,
  removePhysicalStoreAccessGroup,
  removePhysicalStoreAccessUser,
  storePermissionsOf,
} from './index';

const VIEW = Permissions.IN_VIEW_ISSUANCE_FORMS;
const MANAGE = Permissions.IN_MANAGE_ISSUANCE_FORMS;
const PURCHASE = Permissions.IN_VIEW_PURCHASE_FORMS;

let s1: string;
let s2: string;

const give = (
  subjectType: 'user' | 'group',
  subjectId: string,
  physicalStoreId: string,
  permissions: string[]
) =>
  PhysicalStoreAccess.insertAsync({
    physicalStoreId,
    subjectType,
    subjectId,
    permissions,
  });

const heldOn = async (
  subjectType: 'user' | 'group',
  subjectId: string,
  physicalStoreId: string
) =>
  (await PhysicalStoreAccess.findOneAsync({ physicalStoreId, subjectType, subjectId }))
    ?.permissions;

beforeEach(async () => {
  s1 = (await PhysicalStores.insertAsync({ name: 'Store 1' } as never)) as string;
  s2 = (await PhysicalStores.insertAsync({ name: 'Store 2' } as never)) as string;
});

describe('store access resolution', () => {
  it('keeps what a user may do separate for each store', async () => {
    await give('user', 'u1', s1, [VIEW, MANAGE]);
    await give('user', 'u1', s2, [VIEW]);
    const map = await loadStoreAccessMap({ _id: 'u1' });
    expect(storePermissionsOf({ _id: 'u1' }, map, s1).sort()).toEqual(
      [VIEW, MANAGE].sort()
    );
    expect(storePermissionsOf({ _id: 'u1' }, map, s2)).toEqual([VIEW]);
    expect(await hasStorePermission({ _id: 'u1' }, s2, [MANAGE])).toBe(false);
    expect(await hasStorePermission({ _id: 'u1' }, s1, [MANAGE])).toBe(true);
  });

  it('adds the permissions of the groups the user belongs to', async () => {
    await give('user', 'u1', s1, [VIEW]);
    await give('group', 'g1', s1, [MANAGE]);
    await give('group', 'g1', s2, [PURCHASE]);
    await give('group', 'other', s2, [VIEW]);
    const user = { _id: 'u1', groups: ['g1'] };
    const map = await loadStoreAccessMap(user);
    expect(storePermissionsOf(user, map, s1).sort()).toEqual([VIEW, MANAGE].sort());
    expect(storePermissionsOf(user, map, s2)).toEqual([PURCHASE]);
  });

  it('gives a super-admin everything and a locked or missing user nothing', async () => {
    await give('user', 'u1', s1, [VIEW]);
    const empty = await loadStoreAccessMap(null);
    expect(storePermissionsOf({ _id: 'sa', isSuperAdmin: true }, empty, s2)).toEqual(
      StorePermissionValues
    );
    expect(await hasStorePermission({ _id: 'u1', locked: true }, s1, [VIEW])).toBe(false);
    expect(await hasStorePermission(null, s1, [VIEW])).toBe(false);
    expect(await hasAnyStorePermission({ _id: 'u1', locked: true }, [VIEW])).toBe(false);
  });

  it('answers whether the user holds a permission on any store', async () => {
    await give('user', 'u1', s2, [PURCHASE]);
    expect(await hasAnyStorePermission({ _id: 'u1' }, [PURCHASE])).toBe(true);
    expect(await hasAnyStorePermission({ _id: 'u1' }, [VIEW])).toBe(false);
    expect(await hasAnyStorePermission({ _id: 'x' }, [PURCHASE])).toBe(false);
  });

  it('lists the stores the user may open, with their permissions', async () => {
    await give('user', 'u1', s1, [VIEW]);
    const stores = await PhysicalStores.find({}).fetchAsync();
    const result = await filterAccessibleStores({ _id: 'u1' }, stores);
    expect(result.map(item => item.store._id)).toEqual([s1]);
    expect(result[0].permissions).toEqual([VIEW]);
    const all = await filterAccessibleStores({ _id: 'sa', isSuperAdmin: true }, stores);
    expect(all).toHaveLength(2);
  });
});

describe('managing store access', () => {
  const admin = { _id: 'admin' };

  it('gives a karkun’s user and a group permissions, and lists them', async () => {
    const userId = (await Users.insertAsync({
      username: 'ali',
      personId: 'p1',
    } as never)) as string;
    const groupId = (await UserGroups.insertAsync({ name: 'Store keepers' } as never)) as string;

    await addPhysicalStoreAccessUser(
      { physicalStoreId: s1, permission: VIEW, karkunId: 'p1' },
      admin,
      'admin'
    );
    await addPhysicalStoreAccessUser(
      { physicalStoreId: s1, permission: MANAGE, karkunId: 'p1' },
      admin,
      'admin'
    );
    await addPhysicalStoreAccessGroup(
      { physicalStoreId: s1, permission: VIEW, groupId },
      admin,
      'admin'
    );

    expect((await heldOn('user', userId, s1))?.sort()).toEqual([VIEW, MANAGE].sort());
    const listing = await listPhysicalStoreAccess(s1);
    const view = listing.find(item => item.key === VIEW);
    expect(view?.users.map(user => user.userId)).toEqual([userId]);
    expect(view?.groups).toEqual([{ groupId, name: 'Store keepers' }]);
    expect(listing.find(item => item.key === MANAGE)?.groups).toEqual([]);
    expect(listing.map(item => item.key)).toEqual(
      expect.arrayContaining(StorePermissionValues)
    );
    // Each change is logged.
    expect(await SecurityLogs.find({}).countAsync()).toBe(3);
  });

  it('granting the same permission twice changes nothing', async () => {
    const userId = (await Users.insertAsync({ username: 'ali', personId: 'p1' } as never)) as string;
    const params = { physicalStoreId: s1, permission: VIEW, karkunId: 'p1' };
    await addPhysicalStoreAccessUser(params, admin, 'admin');
    await addPhysicalStoreAccessUser(params, admin, 'admin');
    expect(await heldOn('user', userId, s1)).toEqual([VIEW]);
    expect(await SecurityLogs.find({}).countAsync()).toBe(1);
  });

  it('takes permissions away and drops an entry left with none', async () => {
    await give('user', 'u1', s1, [VIEW, MANAGE]);
    await give('group', 'g1', s1, [VIEW]);

    await removePhysicalStoreAccessUser(
      { physicalStoreId: s1, permission: MANAGE, userId: 'u1' },
      admin,
      'admin'
    );
    expect(await heldOn('user', 'u1', s1)).toEqual([VIEW]);
    await removePhysicalStoreAccessUser(
      { physicalStoreId: s1, permission: VIEW, userId: 'u1' },
      admin,
      'admin'
    );
    expect(await heldOn('user', 'u1', s1)).toBeUndefined();

    await removePhysicalStoreAccessGroup(
      { physicalStoreId: s1, permission: VIEW, groupId: 'g1' },
      admin,
      'admin'
    );
    expect(await heldOn('group', 'g1', s1)).toBeUndefined();
  });

  it('does not touch another store’s entry', async () => {
    await give('user', 'u1', s1, [VIEW]);
    await give('user', 'u1', s2, [VIEW]);
    await removePhysicalStoreAccessUser(
      { physicalStoreId: s1, permission: VIEW, userId: 'u1' },
      admin,
      'admin'
    );
    expect(await heldOn('user', 'u1', s2)).toEqual([VIEW]);
  });

  it('refuses bad input', async () => {
    await Users.insertAsync({ username: 'locked', personId: 'p2', locked: true } as never);
    await expect(
      addPhysicalStoreAccessUser(
        { physicalStoreId: s1, permission: 'stores-bogus', karkunId: 'p1' },
        admin,
        'admin'
      )
    ).rejects.toThrow(/Unknown store permission/);
    await expect(
      addPhysicalStoreAccessUser(
        { physicalStoreId: 'nope', permission: VIEW, karkunId: 'p1' },
        admin,
        'admin'
      )
    ).rejects.toThrow(/Store not found/);
    await expect(
      addPhysicalStoreAccessUser(
        { physicalStoreId: s1, permission: VIEW, karkunId: 'nobody' },
        admin,
        'admin'
      )
    ).rejects.toThrow(/does not have a user account/);
    await expect(
      addPhysicalStoreAccessUser(
        { physicalStoreId: s1, permission: VIEW, karkunId: 'p2' },
        admin,
        'admin'
      )
    ).rejects.toThrow(/locked/);
    await expect(
      addPhysicalStoreAccessGroup(
        { physicalStoreId: s1, permission: VIEW, groupId: 'gone' },
        admin,
        'admin'
      )
    ).rejects.toThrow(/User group not found/);
    await expect(
      removePhysicalStoreAccessUser(
        { physicalStoreId: s1, permission: VIEW, userId: 'u1' },
        admin,
        'admin'
      )
    ).rejects.toThrow(/was not given/);
  });
});
