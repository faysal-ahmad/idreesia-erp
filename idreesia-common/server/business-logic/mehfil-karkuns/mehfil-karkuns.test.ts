import { beforeEach, describe, expect, it } from 'vitest';

import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  OrgLocations,
  OrgLocationUsers,
} from 'meteor/idreesia-common/server/collections/admin';

import {
  listMehfilKarkuns,
  listMyMehfilKarkunsLocations,
  loadMehfilKarkunsAccess,
} from './index';

let cityId: string;
let mehfilId: string;

const addUser = (userId: string, permissions: string[], locationId = mehfilId) =>
  OrgLocationUsers.insertAsync({
    locationId,
    userId,
    permissions: permissions.map(permission => `mehfil-karkuns.${permission}`),
  } as never);

// Straight to the driver: these tests are about which people are listed, not
// about the person schema.
const addPerson = (_id: string, doc: Record<string, unknown>) =>
  (
    People.rawCollection() as unknown as {
      insertOne(d: Record<string, unknown>): Promise<unknown>;
    }
  ).insertOne({ _id, sharedData: { name: _id, contactNumber2: '0300' }, ...doc });

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

describe('loadMehfilKarkunsAccess', () => {
  it('returns the permissions held on the mehfil', async () => {
    await addUser('u1', ['view']);
    expect(await loadMehfilKarkunsAccess({ _id: 'u1' }, mehfilId)).toEqual(['view']);
  });

  it('gives a super-admin every permission', async () => {
    expect(
      await loadMehfilKarkunsAccess({ _id: 'sa', isSuperAdmin: true }, mehfilId)
    ).toEqual(['view']);
  });

  it('refuses strangers, locked users, anonymous callers and non-mehfils', async () => {
    await addUser('u1', ['view']);
    await addUser('u1', ['view'], cityId);
    await expect(loadMehfilKarkunsAccess({ _id: 'x' }, mehfilId)).rejects.toThrow();
    await expect(loadMehfilKarkunsAccess(null, mehfilId)).rejects.toThrow();
    await expect(
      loadMehfilKarkunsAccess({ _id: 'u1', locked: true }, mehfilId)
    ).rejects.toThrow();
    await expect(loadMehfilKarkunsAccess({ _id: 'u1' }, cityId)).rejects.toThrow();
  });
});

describe('listMyMehfilKarkunsLocations', () => {
  it('lists the mehfils the user holds a permission on, with their ancestors', async () => {
    await addUser('u1', ['view']);
    const rows = await listMyMehfilKarkunsLocations({ _id: 'u1' });
    expect(rows.map(row => [row.name, row.hasWorkspace])).toEqual([
      ['Karachi', false],
      ['Mehfil', true],
    ]);
  });

  it('lists nothing for a user with no permission', async () => {
    expect(await listMyMehfilKarkunsLocations({ _id: 'u1' })).toEqual([]);
  });
});

describe('listMehfilKarkuns', () => {
  it('lists only the karkuns of the mehfil', async () => {
    await addPerson('here', { isKarkun: true, karkunData: { mehfilLocationId: mehfilId } });
    await addPerson('elsewhere', { isKarkun: true, karkunData: { mehfilLocationId: 'other' } });
    await addPerson('visitor', { isVisitor: true, visitorData: {} });

    const result = await listMehfilKarkuns({ locationId: mehfilId });
    expect(result.data.map(row => row._id)).toEqual(['here']);
    expect(result.totalResults).toBe(1);
    expect(result.data[0].contactNumber2).toBe('0300');
  });
});
