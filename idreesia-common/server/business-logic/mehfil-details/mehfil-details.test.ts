import { beforeEach, describe, expect, it } from 'vitest';

import {
  OrgLocations,
  OrgLocationUsers,
} from 'meteor/idreesia-common/server/collections/admin';

import {
  listMyMehfilDetailsLocations,
  loadMehfilDetailsAccess,
  updateMehfilDetails,
} from './index';

let cityId: string;
let mehfilId: string;

const addUser = (userId: string, permissions: string[], locationId = mehfilId) =>
  OrgLocationUsers.insertAsync({
    locationId,
    userId,
    permissions: permissions.map(permission => `mehfil-details.${permission}`),
  } as never);

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

describe('loadMehfilDetailsAccess', () => {
  it('returns the permissions held on the mehfil', async () => {
    await addUser('u1', ['view']);
    expect(await loadMehfilDetailsAccess({ _id: 'u1' }, mehfilId)).toEqual(['view']);
  });

  it('gives a super-admin every permission', async () => {
    expect(
      await loadMehfilDetailsAccess({ _id: 'sa', isSuperAdmin: true }, mehfilId)
    ).toEqual(['view', 'update']);
  });

  it('refuses strangers, locked users, anonymous callers and non-mehfils', async () => {
    await addUser('u1', ['view']);
    await addUser('u1', ['view'], cityId);
    await expect(loadMehfilDetailsAccess({ _id: 'x' }, mehfilId)).rejects.toThrow();
    await expect(loadMehfilDetailsAccess(null, mehfilId)).rejects.toThrow();
    await expect(
      loadMehfilDetailsAccess({ _id: 'u1', locked: true }, mehfilId)
    ).rejects.toThrow();
    await expect(loadMehfilDetailsAccess({ _id: 'u1' }, cityId)).rejects.toThrow();
  });
});

describe('listMyMehfilDetailsLocations', () => {
  it('lists the mehfils the user holds a permission on, with their ancestors', async () => {
    await addUser('u1', ['view', 'update']);

    const list = await listMyMehfilDetailsLocations({ _id: 'u1' });

    expect(list.map(row => [row.name, row.hasWorkspace, row.permissions])).toEqual([
      ['Karachi', false, []],
      ['Mehfil', true, ['view', 'update']],
    ]);
  });

  it('lists nothing for a user with no permission', async () => {
    expect(await listMyMehfilDetailsLocations({ _id: 'u1' })).toEqual([]);
  });
});

describe('updateMehfilDetails', () => {
  it('saves the details only', async () => {
    const result = await updateMehfilDetails(
      mehfilId,
      { address: 'Street 1', lcdAvailability: true },
      { _id: 'u1' }
    );

    expect(result?.mehfilDetails?.address).toBe('Street 1');
    expect(result?.name).toBe('Mehfil');
    expect(result?.updatedBy).toBe('u1');
  });

  it('leaves attendance geofencing to Admin', async () => {
    await OrgLocations.updateAsync(
      { _id: mehfilId },
      { $set: { mehfilDetails: { latitude: 1, longitude: 2, attendanceGeofencing: true } } }
    );

    // Whatever the caller sends, the stored value stays while there is a location.
    const kept = await updateMehfilDetails(
      mehfilId,
      { latitude: 1, longitude: 2, attendanceGeofencing: false },
      { _id: 'u1' }
    );
    expect(kept?.mehfilDetails?.attendanceGeofencing).toBe(true);

    // Nor can the caller turn it on.
    await OrgLocations.updateAsync(
      { _id: mehfilId },
      { $set: { 'mehfilDetails.attendanceGeofencing': false } }
    );
    const notEnabled = await updateMehfilDetails(
      mehfilId,
      { latitude: 1, longitude: 2, attendanceGeofencing: true },
      { _id: 'u1' }
    );
    expect(notEnabled?.mehfilDetails?.attendanceGeofencing).toBe(false);

    // Clearing the location switches it off.
    await OrgLocations.updateAsync(
      { _id: mehfilId },
      { $set: { 'mehfilDetails.attendanceGeofencing': true } }
    );
    const cleared = await updateMehfilDetails(mehfilId, {}, { _id: 'u1' });
    expect(cleared?.mehfilDetails?.attendanceGeofencing).toBe(false);
  });

  it('refuses a location that is not a mehfil', async () => {
    await expect(
      updateMehfilDetails(cityId, { address: 'x' }, { _id: 'u1' })
    ).rejects.toThrow('Location not found.');
  });
});
