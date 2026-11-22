import { beforeEach, describe, expect, it } from 'vitest';

import {
  OrgLocations,
  OrgLocationUsers,
  Users,
} from 'meteor/idreesia-common/server/collections/admin';
import { People } from 'meteor/idreesia-common/server/collections/common';

import {
  addMehfilPermissionUser,
  listMehfilPermissions,
  listMyMehfilPermissionsLocations,
  loadMehfilPermissionsAccess,
  removeMehfilPermissionUser,
  searchMehfilPermissionsKarkuns,
} from './index';

let cityId: string;
let mehfilId: string;

const addEntry = (userId: string, permissions: string[], locationId = mehfilId) =>
  OrgLocationUsers.insertAsync({
    locationId,
    userId,
    permissions,
  } as never);

const storedOf = async (userId: string) =>
  (await OrgLocationUsers.findOneAsync({ locationId: mehfilId, userId }))
    ?.permissions;

beforeEach(async () => {
  cityId = (await OrgLocations.insertAsync({
    name: 'Karachi',
    type: 'city',
    allParentIds: [],
  } as never)) as string;
  mehfilId = (await OrgLocations.insertAsync({
    name: 'Mehfil',
    type: 'mehfil',
    parentId: cityId,
    allParentIds: [cityId],
  } as never)) as string;
});

describe('loadMehfilPermissionsAccess', () => {
  it('returns the permissions held on the mehfil', async () => {
    await addEntry('u1', ['mehfil-permissions.view', 'mehfil-details.view']);
    expect(await loadMehfilPermissionsAccess({ _id: 'u1' }, mehfilId)).toEqual([
      'view',
    ]);
  });

  it('does not count another feature’s permissions', async () => {
    await addEntry('u1', ['mehfil-details.view']);
    await expect(
      loadMehfilPermissionsAccess({ _id: 'u1' }, mehfilId)
    ).rejects.toThrow();
  });

  it('gives a super-admin every permission', async () => {
    expect(
      await loadMehfilPermissionsAccess({ _id: 'sa', isSuperAdmin: true }, mehfilId)
    ).toEqual(['view', 'manage']);
  });

  it('refuses strangers, locked users, anonymous callers and non-mehfils', async () => {
    await addEntry('u1', ['mehfil-permissions.view'], cityId);
    await expect(loadMehfilPermissionsAccess({ _id: 'x' }, mehfilId)).rejects.toThrow();
    await expect(loadMehfilPermissionsAccess(null, mehfilId)).rejects.toThrow();
    await expect(
      loadMehfilPermissionsAccess({ _id: 'u1', locked: true }, mehfilId)
    ).rejects.toThrow();
    await expect(loadMehfilPermissionsAccess({ _id: 'u1' }, cityId)).rejects.toThrow();
  });
});

describe('listMyMehfilPermissionsLocations', () => {
  it('lists the mehfils the user holds a permission on, with their ancestors', async () => {
    await addEntry('u1', ['mehfil-permissions.view', 'mehfil-permissions.manage']);

    const list = await listMyMehfilPermissionsLocations({ _id: 'u1' });

    expect(list.map(row => [row.name, row.hasWorkspace, row.permissions])).toEqual([
      ['Karachi', false, []],
      ['Mehfil', true, ['view', 'manage']],
    ]);
  });

  it('lists nothing for a user with no permission', async () => {
    await addEntry('u1', ['mehfil-details.view']);
    expect(await listMyMehfilPermissionsLocations({ _id: 'u1' })).toEqual([]);
  });
});

describe('listMehfilPermissions', () => {
  it('lists every feature’s permissions with the users holding them', async () => {
    await Users.insertAsync({ _id: 'u1', username: 'ali', displayName: 'Ali' } as never);
    await addEntry('u1', ['mehfil-details.view', 'mehfil-details.update']);

    const groups = await listMehfilPermissions(mehfilId);

    const details = groups.find(group => group.featureKey === 'mehfil-details');
    expect(details?.permissions.map(permission => permission.key)).toEqual([
      'view',
      'update',
    ]);
    expect(details?.permissions[1].users).toMatchObject([
      { userId: 'u1', username: 'ali', displayName: 'Ali' },
    ]);
    expect(groups.map(group => group.featureKey)).toEqual(
      expect.arrayContaining([
        'duties-attendance',
        'mehfil-details',
        'mehfil-permissions',
      ])
    );
  });
});

describe('addMehfilPermissionUser', () => {
  beforeEach(async () => {
    await Users.insertAsync({ _id: 'u1', personId: 'k1' } as never);
    await Users.insertAsync({ _id: 'locked', personId: 'k2', locked: true } as never);
  });

  it('gives the permission together with the feature’s base permission', async () => {
    await addMehfilPermissionUser(mehfilId, 'mehfil-details', 'update', 'k1', 'admin');

    expect((await storedOf('u1'))?.sort()).toEqual([
      'mehfil-details.update',
      'mehfil-details.view',
    ]);
  });

  it('keeps the permissions the user already holds', async () => {
    await addEntry('u1', ['duties-attendance.view']);
    await addMehfilPermissionUser(mehfilId, 'mehfil-details', 'view', 'k1', 'admin');

    expect((await storedOf('u1'))?.sort()).toEqual([
      'duties-attendance.view',
      'mehfil-details.view',
    ]);
  });

  it('refuses a karkun without an account, a locked one, and unknown permissions', async () => {
    await expect(
      addMehfilPermissionUser(mehfilId, 'mehfil-details', 'view', 'nobody', 'admin')
    ).rejects.toThrow('does not have a user account');
    await expect(
      addMehfilPermissionUser(mehfilId, 'mehfil-details', 'view', 'k2', 'admin')
    ).rejects.toThrow('locked');
    await expect(
      addMehfilPermissionUser(mehfilId, 'mehfil-details', 'fly', 'k1', 'admin')
    ).rejects.toThrow('Unknown permission');
    await expect(
      addMehfilPermissionUser(mehfilId, 'nothing', 'view', 'k1', 'admin')
    ).rejects.toThrow('Unknown location feature');
  });

  it('refuses a location that is not a mehfil', async () => {
    await expect(
      addMehfilPermissionUser(cityId, 'mehfil-details', 'view', 'k1', 'admin')
    ).rejects.toThrow('Location not found.');
  });
});

describe('removeMehfilPermissionUser', () => {
  it('takes one permission and leaves the others', async () => {
    await addEntry('u1', ['mehfil-details.view', 'mehfil-details.update']);

    await removeMehfilPermissionUser(mehfilId, 'mehfil-details', 'update', 'u1', 'admin');

    expect(await storedOf('u1')).toEqual(['mehfil-details.view']);
  });

  it('takes the whole feature with its base permission, keeping other features', async () => {
    await addEntry('u1', [
      'mehfil-details.view',
      'mehfil-details.update',
      'duties-attendance.view',
    ]);

    await removeMehfilPermissionUser(mehfilId, 'mehfil-details', 'view', 'u1', 'admin');

    expect(await storedOf('u1')).toEqual(['duties-attendance.view']);
  });

  it('removes a user left with nothing, and refuses one without the permission', async () => {
    await addEntry('u1', ['mehfil-details.view']);

    await removeMehfilPermissionUser(mehfilId, 'mehfil-details', 'view', 'u1', 'admin');

    expect(await storedOf('u1')).toBeUndefined();
    await expect(
      removeMehfilPermissionUser(mehfilId, 'mehfil-details', 'view', 'u1', 'admin')
    ).rejects.toThrow('does not have this permission');
  });
});

describe('searchMehfilPermissionsKarkuns', () => {
  // Straight to the driver: these tests are about which people are listed.
  const insert = (collection: { rawCollection(): unknown }, doc: Record<string, unknown>) =>
    (collection.rawCollection() as { insertOne(d: unknown): Promise<unknown> }).insertOne(doc);
  const addKarkun = (_id: string, mehfilLocationId: string) =>
    insert(People, {
      _id,
      isKarkun: true,
      sharedData: { name: _id },
      karkunData: { mehfilLocationId },
    });

  it('lists only karkuns of the mehfil who have a user account', async () => {
    await addKarkun('with-account', 'm1');
    await addKarkun('no-account', 'm1');
    await addKarkun('other-mehfil', 'm2');
    await insert(Users, { _id: 'ua', username: 'amy', personId: 'with-account' });
    await insert(Users, { _id: 'ub', username: 'bob', personId: 'other-mehfil' });

    const result = await searchMehfilPermissionsKarkuns({ locationId: 'm1' });

    expect(result.totalResults).toBe(1);
    expect(result.data.map(row => row._id)).toEqual(['with-account']);
  });
});
