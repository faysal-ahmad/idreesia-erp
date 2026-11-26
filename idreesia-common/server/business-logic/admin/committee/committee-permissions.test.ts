import { describe, expect, it } from 'vitest';

import { Committees, OrgLocations } from 'meteor/idreesia-common/server/collections/admin';
import { SecurityLogs } from 'meteor/idreesia-common/server/collections/common';

import {
  changeCommitteePermission,
  committeeHolderKarkunIds,
  listCommitteesHolding,
  listLocationCommitteesForPicker,
} from './committee-permissions';

const actingUser = { _id: 'admin' };

const addCommittee = (doc: Record<string, unknown> = {}) =>
  Committees.insertAsync({
    name: `c-${Math.random()}`,
    locationId: `loc-${Math.random()}`,
    ...doc,
  } as never) as Promise<string>;

const permissionsOf = async (committeeId: string) =>
  ((await Committees.findOneAsync(committeeId)) as { permissions?: string[] })
    .permissions ?? [];

describe('changeCommitteePermission', () => {
  it('adds and removes a permission, logging each change', async () => {
    const committeeId = await addCommittee();

    await changeCommitteePermission(committeeId, 'p1', true, actingUser);
    expect(await permissionsOf(committeeId)).toEqual(['p1']);

    await changeCommitteePermission(committeeId, 'p1', false, actingUser);
    expect(await permissionsOf(committeeId)).toEqual([]);

    const logs = await SecurityLogs.find({ committeeId }).fetchAsync();
    expect(logs).toHaveLength(2);
    expect(logs[0]).toMatchObject({
      operationBy: 'admin',
      operationDetails: { permissionsAdded: ['p1'], permissionsRemoved: [] },
    });
  });

  it('does nothing when there is nothing to change', async () => {
    const committeeId = await addCommittee({ permissions: ['p1'] });
    await changeCommitteePermission(committeeId, 'p1', true, actingUser);
    await changeCommitteePermission(committeeId, 'p2', false, actingUser);
    expect(await permissionsOf(committeeId)).toEqual(['p1']);
    expect(await SecurityLogs.find({ committeeId }).countAsync()).toBe(0);
  });

  it('throws for an unknown committee', async () => {
    await expect(
      changeCommitteePermission('missing', 'p1', true, actingUser)
    ).rejects.toThrow('Committee not found.');
  });
});

describe('listing committee holders', () => {
  it('lists the committees holding a permission with their location', async () => {
    const key = `k-${Math.random()}`;
    const locationId = (await OrgLocations.insertAsync({
      name: 'Lahore',
      type: 'city',
    } as never)) as string;
    const committeeId = await addCommittee({
      name: 'Langar',
      locationId,
      permissions: [key],
    });
    await addCommittee({ permissions: ['other'] });

    expect(await listCommitteesHolding([key])).toEqual([
      {
        committeeId,
        name: 'Langar',
        locationId,
        locationName: 'Lahore',
        permissions: [key],
      },
    ]);
  });

  it('gives the karkuns of members and coordinators only', async () => {
    const key = `k-${Math.random()}`;
    await addCommittee({
      permissions: [key],
      members: [
        { karkunId: 'm', role: 'member' },
        { karkunId: 'c', role: 'coordinator' },
        { karkunId: 'g', role: 'guest' },
        { karkunId: 'o', role: 'observer' },
      ],
    });
    expect((await committeeHolderKarkunIds([key])).sort()).toEqual(['c', 'm']);
  });

  it('lists a location committees with their member counts', async () => {
    const locationId = `loc-${Math.random()}`;
    const committeeId = await addCommittee({
      name: 'A',
      locationId,
      color: 'red',
      members: [
        { karkunId: 'm', role: 'member' },
        { karkunId: 'g', role: 'guest' },
      ],
    });
    expect(await listLocationCommitteesForPicker(locationId)).toEqual([
      { _id: committeeId, name: 'A', color: 'red', memberCount: 1 },
    ]);
  });
});
