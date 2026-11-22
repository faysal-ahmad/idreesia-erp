import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { OrgLocationGeneralPermissions } from 'meteor/idreesia-common/constants/organization';
import {
  OrgLocations,
  OrgLocationUsers,
  Users,
} from 'meteor/idreesia-common/server/collections/admin';
import { listMyDutiesAttendanceLocations } from 'meteor/idreesia-common/server/business-logic/duties-attendance';

import {
  addOrgLocationFeatureUser,
  hasOrgLocationPermission,
  listOrgLocationFeaturePermissions,
  removeOrgLocationFeatureUser,
} from './org-location-features';

const FEATURE = 'duties-attendance';

let mehfilId: string;
let cityId: string;

beforeEach(async () => {
  cityId = (await OrgLocations.insertAsync({
    name: 'Karachi',
    type: 'city',
  } as never)) as string;
  mehfilId = (await OrgLocations.insertAsync({
    name: 'Gulshan Mehfil',
    type: 'mehfil',
    parentId: cityId,
    allParentIds: [cityId],
  } as never)) as string;
});

const failsWith = (code: string) => ({ extensions: { code } });
const addUser = (permission: string, userId = 'u1') =>
  addOrgLocationFeatureUser(
    mehfilId,
    FEATURE,
    permission,
    `p-${userId}`,
    'admin'
  );
const removeUser = (permission: string, userId = 'u1') =>
  removeOrgLocationFeatureUser(mehfilId, FEATURE, permission, userId, 'admin');

// The stored permissions of a user on the mehfil, e.g. duties-attendance.view.
const locationUser = (userId = 'u1') =>
  OrgLocationUsers.findOneAsync({ locationId: mehfilId, userId });

describe('feature permissions through the location', () => {
  const stored = async (userId = 'u1') =>
    (await locationUser(userId))?.permissions.slice().sort();

  it('needs a known permission and a mehfil', async () => {
    await Users.insertAsync({ _id: 'u1', personId: 'p-u1' } as any);
    await expect(addUser('fly')).rejects.toMatchObject(
      failsWith('BAD_USER_INPUT')
    );
    await expect(
      addOrgLocationFeatureUser(mehfilId, 'teleport', 'view', 'p-u1', 'admin')
    ).rejects.toMatchObject(failsWith('BAD_USER_INPUT'));
    await expect(
      addOrgLocationFeatureUser(cityId, FEATURE, 'view', 'p-u1', 'admin')
    ).rejects.toMatchObject(failsWith('BAD_USER_INPUT'));
    await expect(
      addOrgLocationFeatureUser('nowhere', FEATURE, 'view', 'p-u1', 'admin')
    ).rejects.toMatchObject(failsWith('NOT_FOUND'));
  });

  it('needs a karkun with an unlocked user account', async () => {
    await expect(
      addOrgLocationFeatureUser(mehfilId, FEATURE, 'view', 'p-none', 'admin')
    ).rejects.toMatchObject(failsWith('BAD_USER_INPUT'));

    await Users.insertAsync({
      _id: 'u3',
      personId: 'p-u3',
      locked: true,
    } as any);
    await expect(addUser('view', 'u3')).rejects.toMatchObject(
      failsWith('BAD_USER_INPUT')
    );
  });

  it('grants permissions one at a time, View coming along', async () => {
    await Users.insertAsync({ _id: 'u1', personId: 'p-u1' } as any);

    await addUser('mark-attendance');
    expect(await stored()).toEqual([
      'duties-attendance.mark-attendance',
      'duties-attendance.view',
    ]);

    await addUser('manage-and-plan-duties');
    await addUser('manage-and-plan-duties'); // repeating is harmless
    expect(await stored()).toEqual([
      'duties-attendance.manage-and-plan-duties',
      'duties-attendance.mark-attendance',
      'duties-attendance.view',
    ]);
  });

  it('takes a permission away, and the user with View', async () => {
    await Users.insertAsync({ _id: 'u1', personId: 'p-u1' } as any);
    await addUser('mark-attendance');

    await removeUser('mark-attendance');
    expect(await stored()).toEqual(['duties-attendance.view']);
    await expect(removeUser('mark-attendance')).rejects.toMatchObject(
      failsWith('NOT_FOUND')
    );

    await addUser('mark-attendance');
    await removeUser('view');
    expect(await locationUser()).toBeUndefined();
  });

  it('lists the features of a mehfil with the users of each permission', async () => {
    await Users.insertAsync({ _id: 'u1', personId: 'p-u1' } as any);
    await Users.insertAsync({ _id: 'u2', personId: 'p-u2' } as any);
    expect(await listOrgLocationFeaturePermissions(cityId)).toEqual([]);
    await addUser('mark-attendance', 'u1');
    await addUser('view', 'u2');

    const [feature] = await listOrgLocationFeaturePermissions(mehfilId);
    expect(feature).toMatchObject({
      featureKey: FEATURE,
      featureName: 'Duties and Attendance',
    });
    expect(
      feature.permissions.map(({ key, userIds }) => [key, userIds])
    ).toEqual([
      ['view', ['u1', 'u2']],
      ['manage-and-plan-duties', []],
      ['mark-attendance', ['u1']],
    ]);
  });
});

describe('general permissions of the location', () => {
  beforeEach(() => {
    OrgLocationGeneralPermissions.push({
      key: 'edit-details',
      name: 'Edit details',
      description: 'Edit the details of the mehfil.',
    });
    return Users.insertAsync({ _id: 'u1', personId: 'p-u1' } as any);
  });
  afterEach(() => {
    OrgLocationGeneralPermissions.splice(0);
  });

  const addGeneral = (permission = 'edit-details', userId = 'u1') =>
    addOrgLocationFeatureUser(mehfilId, 'location', permission, `p-${userId}`, 'admin');

  it('are held on the location, next to feature permissions', async () => {
    await addGeneral();
    await addUser('view');

    expect(await locationUser()).toMatchObject({
      permissions: ['location.edit-details', 'duties-attendance.view'],
    });
    expect(await OrgLocationUsers.find({ locationId: mehfilId }).countAsync()).toBe(1);
    expect(await hasOrgLocationPermission('u1', mehfilId, 'location', 'edit-details')).toBe(true);
    expect(await hasOrgLocationPermission('u1', mehfilId, FEATURE, 'view')).toBe(true);
    expect(await hasOrgLocationPermission('u2', mehfilId, 'location', 'edit-details')).toBe(false);

    const groups = await listOrgLocationFeaturePermissions(mehfilId);
    expect(groups.map(group => group.featureKey)).toEqual(['location', FEATURE, 'mehfil-details', 'mehfil-karkuns', 'mehfil-permissions']);
    expect(groups[0].permissions).toMatchObject([
      { key: 'edit-details', userIds: ['u1'] },
    ]);
  });

  it('are refused when unknown, and taking the last one removes the user', async () => {
    await expect(addGeneral('fly')).rejects.toMatchObject(failsWith('BAD_USER_INPUT'));

    await addGeneral();
    await removeOrgLocationFeatureUser(mehfilId, 'location', 'edit-details', 'u1', 'admin');
    expect(await locationUser()).toBeUndefined();
    await expect(
      removeOrgLocationFeatureUser(mehfilId, 'location', 'edit-details', 'u1', 'admin')
    ).rejects.toMatchObject(failsWith('NOT_FOUND'));
  });

  it("survive taking away a feature's View", async () => {
    await addGeneral();
    await addUser('mark-attendance');

    await removeUser('view');

    expect((await locationUser())?.permissions).toEqual(['location.edit-details']);
  });
});

describe('listMyDutiesAttendanceLocations', () => {
  const second = async () => {
    const id = (await OrgLocations.insertAsync({
      name: 'Defence Mehfil',
      type: 'mehfil',
      parentId: cityId,
      allParentIds: [cityId],
    } as never)) as string;
    return id;
  };

  it("lists the locations where the caller is a workspace user, with their permissions", async () => {
    await Users.insertAsync({ _id: 'u1', personId: 'p-u1' } as any);
    await second();
    await addUser('mark-attendance');

    // The city above the mehfil comes along, without a workspace (sorted by name).
    expect(await listMyDutiesAttendanceLocations({ _id: 'u1' })).toEqual([
      {
        locationId: mehfilId,
        name: 'Gulshan Mehfil',
        type: 'mehfil',
        parentId: cityId,
        hasWorkspace: true,
        permissions: ['view', 'mark-attendance'],
      },
      {
        locationId: cityId,
        name: 'Karachi',
        type: 'city',
        parentId: null,
        hasWorkspace: false,
        permissions: [],
      },
    ]);
    expect(await listMyDutiesAttendanceLocations({ _id: 'stranger' })).toEqual([]);
  });

  it('gives a super-admin every mehfil with every permission', async () => {
    const other = await second();

    const mine = await listMyDutiesAttendanceLocations({
      _id: 'sa',
      isSuperAdmin: true,
    });

    const withWorkspace = mine.filter(item => item.hasWorkspace);
    expect(withWorkspace.map(item => item.locationId)).toEqual([other, mehfilId]);
    expect(withWorkspace[0].permissions).toEqual([
      'view',
      'manage-and-plan-duties',
      'mark-attendance',
    ]);
  });

  it('leaves out locations that are not mehfils, locked users and nobody', async () => {
    await Users.insertAsync({ _id: 'u1', personId: 'p-u1' } as any);
    await addUser('view');

    expect(await listMyDutiesAttendanceLocations({ _id: 'u1', locked: true })).toEqual([]);
    expect(await listMyDutiesAttendanceLocations(null)).toEqual([]);

    await OrgLocations.updateAsync(mehfilId, { $set: { type: 'city' } });
    expect(await listMyDutiesAttendanceLocations({ _id: 'u1' })).toEqual([]);
  });
});
