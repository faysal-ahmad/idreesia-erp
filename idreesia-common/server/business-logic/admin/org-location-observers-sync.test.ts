import { beforeEach, describe, expect, it, vi } from 'vitest';

import { OrgLocationTypes } from 'meteor/idreesia-common/constants/organization';
import {
  Committees,
  OrgLocations,
} from 'meteor/idreesia-common/server/collections/admin';
import { People } from 'meteor/idreesia-common/server/collections/common';

import { createOrgLocation } from './org-locations';
import { getOrgLocationObserverStats } from './org-location-observer-stats';
import { syncOrgLocationObservers } from './org-location-observers-sync';

// Notifying members pulls in face recognition (opencv), which is not needed here.
vi.mock('meteor/idreesia-common/server/business-logic/common/compute-image-vector-data', () => ({}));

const user = { _id: 'u1' };

let pk: string;
let zone: string;
let city: string;
let mehfil: string;
let pkCommittee: string;
let zoneCommittee: string;
let cityCommittee: string;
let mehfilCommittee: string;

const addCommittee = async (locationId: string, members: any[] = []) =>
  Committees.insertAsync({ name: 'C', locationId, members } as any);

const setObservers = (locationId: string, ids: string[]) =>
  OrgLocations.updateAsync(locationId, { $set: { observerKarkunIds: ids } });

const rolesOf = async (committeeId: string) =>
  Object.fromEntries(
    ((await Committees.findOneAsync(committeeId)) as any).members.map(
      (m: any) => [m.karkunId, m.role]
    )
  );

const INHERITED = 'inherited_observer';

beforeEach(async () => {
  for (const _id of ['k1', 'k2', 'k3']) {
    // eslint-disable-next-line no-await-in-loop
    await People.insertAsync({ _id, isKarkun: true, sharedData: { name: _id } } as any);
  }
  const root = await createOrgLocation({ name: 'Idreesia', type: OrgLocationTypes.ROOT }, user);
  pk = (await createOrgLocation(
    { name: 'Pakistan', type: OrgLocationTypes.COUNTRY, parentId: root!._id },
    user
  ))!._id!;
  zone = (await createOrgLocation(
    { name: 'Zone A', type: OrgLocationTypes.GROUP, parentId: pk },
    user
  ))!._id!;
  city = (await createOrgLocation(
    { name: 'Lahore', type: OrgLocationTypes.CITY, parentId: zone },
    user
  ))!._id!;
  mehfil = (await createOrgLocation(
    { name: 'Mehfil 1', type: OrgLocationTypes.MEHFIL, parentId: city },
    user
  ))!._id!;
  pkCommittee = await addCommittee(pk);
  zoneCommittee = await addCommittee(zone);
  cityCommittee = await addCommittee(city);
  mehfilCommittee = await addCommittee(mehfil);
});

describe('syncOrgLocationObservers', () => {
  it('adds the observers to the committees below the location only', async () => {
    await setObservers(zone, ['k1']);
    const result = await syncOrgLocationObservers(zone, user);

    expect(result).toEqual({ committeesChecked: 2, addedCount: 2, removedCount: 0 });
    expect(await rolesOf(cityCommittee)).toEqual({ k1: INHERITED });
    expect(await rolesOf(mehfilCommittee)).toEqual({ k1: INHERITED });
    expect(await rolesOf(zoneCommittee)).toEqual({});
    expect(await rolesOf(pkCommittee)).toEqual({});
  });

  it('leaves people with another role on the committee alone', async () => {
    await Committees.updateAsync(cityCommittee, {
      $set: {
        members: [
          { karkunId: 'k1', role: 'coordinator' },
          { karkunId: 'k2', role: 'observer' },
        ],
      },
    });
    await setObservers(zone, ['k1', 'k2']);
    await syncOrgLocationObservers(zone, user);

    expect(await rolesOf(cityCommittee)).toEqual({
      k1: 'coordinator',
      k2: 'observer',
    });
  });

  it('removes inherited observers that are no longer observers', async () => {
    await setObservers(zone, ['k1']);
    await syncOrgLocationObservers(zone, user);
    await setObservers(zone, []);
    const result = await syncOrgLocationObservers(zone, user);

    expect(result.removedCount).toBe(2);
    expect(await rolesOf(cityCommittee)).toEqual({});
    expect(await rolesOf(mehfilCommittee)).toEqual({});
  });

  it('keeps a person who is still an observer of a lower location', async () => {
    await setObservers(zone, ['k1']);
    await setObservers(city, ['k1']);
    await syncOrgLocationObservers(zone, user);

    await setObservers(zone, []);
    await syncOrgLocationObservers(zone, user);

    expect(await rolesOf(cityCommittee)).toEqual({});
    expect(await rolesOf(mehfilCommittee)).toEqual({ k1: INHERITED });
  });

  it('keeps a person who is still an observer of a location above', async () => {
    await setObservers(pk, ['k1']);
    await setObservers(zone, ['k1']);
    await syncOrgLocationObservers(pk, user);

    await setObservers(zone, []);
    await syncOrgLocationObservers(zone, user);

    expect(await rolesOf(cityCommittee)).toEqual({ k1: INHERITED });
    expect(await rolesOf(mehfilCommittee)).toEqual({ k1: INHERITED });
  });

  it('counts the committees each observer covers', async () => {
    await setObservers(zone, ['k1', 'k2']);
    expect(
      await getOrgLocationObserverStats((await OrgLocations.findOneAsync(zone))!)
    ).toEqual([
      { karkunId: 'k1', observedCommitteeCount: 0, observedCommitteeIds: [] },
      { karkunId: 'k2', observedCommitteeCount: 0, observedCommitteeIds: [] },
    ]);

    await syncOrgLocationObservers(zone, user);
    const stats = await getOrgLocationObserverStats(
      (await OrgLocations.findOneAsync(zone))!
    );
    expect(stats.map(s => s.observedCommitteeCount)).toEqual([2, 2]);
    expect(stats[0].observedCommitteeIds.sort()).toEqual(
      [cityCommittee, mehfilCommittee].sort()
    );
  });
});
