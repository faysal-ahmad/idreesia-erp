import { beforeEach, describe, expect, it } from 'vitest';

import {
  OrgLocations,
  Users,
} from 'meteor/idreesia-common/server/collections/admin';
import {
  DutiesAttendanceWorkspaces,
  DutiesAttendanceWorkspaceUsers,
} from 'meteor/idreesia-common/server/collections/duties-attendance';
import { listMyDutiesAttendanceLocations } from 'meteor/idreesia-common/server/business-logic/duties-attendance';

import {
  addOrgLocationFeatureUser,
  disableOrgLocationFeature,
  enableOrgLocationFeature,
  getLocationDutiesAttendanceWorkspaceId,
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

const location = (id: string) => OrgLocations.findOneAsync({ _id: id }) as Promise<any>;
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

describe('enableOrgLocationFeature', () => {
  it('creates a workspace for a mehfil and records the feature', async () => {
    await enableOrgLocationFeature(mehfilId, FEATURE, 'admin');

    const enabled = await location(mehfilId);
    expect(enabled.features).toEqual([FEATURE]);
    const workspace = await DutiesAttendanceWorkspaces.findOneAsync(
      enabled.dutiesAttendanceWorkspaceId
    );
    expect(workspace).toMatchObject({
      name: 'Gulshan Mehfil Duties and Attendance',
      metadata: { locationId: mehfilId },
    });
    expect(getLocationDutiesAttendanceWorkspaceId(enabled)).toBe(workspace?._id);
  });

  it('is safe to repeat: no second workspace, no repeated feature', async () => {
    await enableOrgLocationFeature(mehfilId, FEATURE, 'admin');
    const first = (await location(mehfilId)).dutiesAttendanceWorkspaceId;

    await enableOrgLocationFeature(mehfilId, FEATURE, 'admin');

    const again = await location(mehfilId);
    expect(again.features).toEqual([FEATURE]);
    expect(again.dutiesAttendanceWorkspaceId).toBe(first);
    expect(await DutiesAttendanceWorkspaces.find({}).countAsync()).toBe(1);
  });

  it('refuses locations that are not mehfils, unknown features and unknown locations', async () => {
    await expect(
      enableOrgLocationFeature(cityId, FEATURE, 'admin')
    ).rejects.toMatchObject(failsWith('BAD_USER_INPUT'));
    await expect(
      enableOrgLocationFeature(mehfilId, 'teleport', 'admin')
    ).rejects.toMatchObject(failsWith('BAD_USER_INPUT'));
    await expect(
      enableOrgLocationFeature('nowhere', FEATURE, 'admin')
    ).rejects.toMatchObject(failsWith('NOT_FOUND'));
    expect((await location(cityId)).features).toBeUndefined();
    expect(await DutiesAttendanceWorkspaces.find({}).countAsync()).toBe(0);
  });
});

describe('disableOrgLocationFeature', () => {
  it('soft-deletes the workspace and keeps it for a later enable', async () => {
    await enableOrgLocationFeature(mehfilId, FEATURE, 'admin');
    const workspaceId = (await location(mehfilId)).dutiesAttendanceWorkspaceId;
    await Users.insertAsync({ _id: 'u1', personId: 'p-u1' } as any);
    await addUser('view');

    await disableOrgLocationFeature(mehfilId, FEATURE, 'admin');

    const disabled = await location(mehfilId);
    expect(disabled.features).toEqual([]);
    expect(disabled.dutiesAttendanceWorkspaceId).toBe(workspaceId);
    expect(
      (await DutiesAttendanceWorkspaces.findOneAsync(workspaceId))?.deletedAt
    ).toBeInstanceOf(Date);
    expect(() => getLocationDutiesAttendanceWorkspaceId(disabled)).toThrow(
      'not enabled'
    );

    await enableOrgLocationFeature(mehfilId, FEATURE, 'admin');

    const reenabled = await location(mehfilId);
    expect(reenabled.features).toEqual([FEATURE]);
    expect(reenabled.dutiesAttendanceWorkspaceId).toBe(workspaceId);
    expect(
      (await DutiesAttendanceWorkspaces.findOneAsync(workspaceId))?.deletedAt
    ).toBeUndefined();
    // The users came back with it.
    expect(
      await DutiesAttendanceWorkspaceUsers.find({ workspaceId }).countAsync()
    ).toBe(1);
  });

  it('refuses locations that are not mehfils', async () => {
    await expect(
      disableOrgLocationFeature(cityId, FEATURE, 'admin')
    ).rejects.toMatchObject(failsWith('BAD_USER_INPUT'));
  });
});

describe('feature permissions through the location', () => {
  const workspaceUser = async (userId = 'u1') =>
    DutiesAttendanceWorkspaceUsers.findOneAsync({
      workspaceId: (await location(mehfilId)).dutiesAttendanceWorkspaceId,
      userId,
    });

  it('needs the feature on and a known permission', async () => {
    await Users.insertAsync({ _id: 'u1', personId: 'p-u1' } as any);
    await expect(addUser('view')).rejects.toMatchObject(failsWith('NOT_FOUND'));

    await enableOrgLocationFeature(mehfilId, FEATURE, 'admin');
    await expect(addUser('fly')).rejects.toMatchObject(
      failsWith('BAD_USER_INPUT')
    );
    await expect(
      addOrgLocationFeatureUser(mehfilId, 'teleport', 'view', 'p-u1', 'admin')
    ).rejects.toMatchObject(failsWith('BAD_USER_INPUT'));
  });

  it('needs a karkun with an unlocked user account', async () => {
    await enableOrgLocationFeature(mehfilId, FEATURE, 'admin');
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
    await enableOrgLocationFeature(mehfilId, FEATURE, 'admin');

    await addUser('mark-attendance');
    expect((await workspaceUser())?.permissions).toEqual([
      'view',
      'mark-attendance',
    ]);

    await addUser('manage-and-plan-duties');
    await addUser('manage-and-plan-duties'); // repeating is harmless
    expect((await workspaceUser())?.permissions).toEqual([
      'view',
      'manage-and-plan-duties',
      'mark-attendance',
    ]);
  });

  it('takes a permission away, and the user with View', async () => {
    await Users.insertAsync({ _id: 'u1', personId: 'p-u1' } as any);
    await enableOrgLocationFeature(mehfilId, FEATURE, 'admin');
    await addUser('mark-attendance');

    await removeUser('mark-attendance');
    expect((await workspaceUser())?.permissions).toEqual(['view']);
    await expect(removeUser('mark-attendance')).rejects.toMatchObject(
      failsWith('NOT_FOUND')
    );

    await addUser('mark-attendance');
    await removeUser('view');
    expect(await workspaceUser()).toBeUndefined();
  });

  it('lists the enabled features with the users of each permission', async () => {
    await Users.insertAsync({ _id: 'u1', personId: 'p-u1' } as any);
    await Users.insertAsync({ _id: 'u2', personId: 'p-u2' } as any);
    expect(await listOrgLocationFeaturePermissions(mehfilId)).toEqual([]);

    await enableOrgLocationFeature(mehfilId, FEATURE, 'admin');
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

describe('listMyDutiesAttendanceLocations', () => {
  const second = async () => {
    const id = (await OrgLocations.insertAsync({
      name: 'Defence Mehfil',
      type: 'mehfil',
      parentId: cityId,
      allParentIds: [cityId],
    } as never)) as string;
    await enableOrgLocationFeature(id, FEATURE, 'admin');
    return id;
  };

  it("lists the locations where the caller is a workspace user, with their permissions", async () => {
    await Users.insertAsync({ _id: 'u1', personId: 'p-u1' } as any);
    await enableOrgLocationFeature(mehfilId, FEATURE, 'admin');
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

  it('gives a super-admin every enabled location with every permission', async () => {
    await enableOrgLocationFeature(mehfilId, FEATURE, 'admin');
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

  it('leaves out disabled locations, locked users and nobody', async () => {
    await Users.insertAsync({ _id: 'u1', personId: 'p-u1' } as any);
    await enableOrgLocationFeature(mehfilId, FEATURE, 'admin');
    await addUser('view');

    expect(await listMyDutiesAttendanceLocations({ _id: 'u1', locked: true })).toEqual([]);
    expect(await listMyDutiesAttendanceLocations(null)).toEqual([]);

    await disableOrgLocationFeature(mehfilId, FEATURE, 'admin');
    expect(await listMyDutiesAttendanceLocations({ _id: 'u1' })).toEqual([]);
  });
});
