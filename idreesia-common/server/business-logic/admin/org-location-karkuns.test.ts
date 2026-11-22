import { describe, expect, it } from 'vitest';

import { People } from 'meteor/idreesia-common/server/collections/common';
import { OrgLocations, Users } from 'meteor/idreesia-common/server/collections/admin';

import { listOrgLocationKarkuns } from './org-location-karkuns';

type Doc = Record<string, unknown>;

// Straight to the driver: these tests are about which people are listed, not
// about the schemas.
const insert = (collection: { rawCollection(): unknown }, doc: Doc) =>
  (collection.rawCollection() as { insertOne(d: Doc): Promise<unknown> }).insertOne(doc);

const addKarkun = (_id: string, mehfilLocationId: string) =>
  insert(People, {
    _id,
    isKarkun: true,
    sharedData: { name: _id },
    karkunData: { mehfilLocationId },
  });

describe('listOrgLocationKarkuns', () => {
  it('lists the karkuns of the mehfil and marks those with a user account', async () => {
    await addKarkun('with-account', 'm1');
    await addKarkun('no-account', 'm1');
    await addKarkun('other-mehfil', 'm2');
    await insert(People, { _id: 'visitor', isVisitor: true, sharedData: { name: 'visitor' } });
    await insert(Users, { _id: 'u1', username: 'amy', personId: 'with-account' });

    const result = await listOrgLocationKarkuns({ locationId: 'm1' });

    expect(result.totalResults).toBe(2);
    expect(result.data.map(row => [row._id, row.hasUserAccount])).toEqual([
      ['no-account', false],
      ['with-account', true],
    ]);
  });

  it('can list only the karkuns that have a user account', async () => {
    await addKarkun('with-account', 'm1');
    await addKarkun('no-account', 'm1');
    await addKarkun('other-mehfil', 'm2');
    await insert(Users, { _id: 'u1', username: 'amy', personId: 'with-account' });
    await insert(Users, { _id: 'u2', username: 'bob', personId: 'other-mehfil' });

    const result = await listOrgLocationKarkuns({
      locationId: 'm1',
      withUserAccount: true,
    });

    expect(result.totalResults).toBe(1);
    expect(result.data.map(row => row._id)).toEqual(['with-account']);
  });

  describe('with the locations below', () => {
    // root > zone > city (c1) > mehfils m1, m2; a second city (c2) > m3.
    const seedTree = async () => {
      const raw = OrgLocations.rawCollection() as unknown as {
        insertOne(d: Doc): Promise<unknown>;
      };
      await raw.insertOne({ _id: 'root', name: 'Root', type: 'root', allParentIds: [] });
      await raw.insertOne({ _id: 'zone', name: 'Zone', type: 'group', parentId: 'root', allParentIds: ['root'] });
      await raw.insertOne({ _id: 'c1', name: 'City 1', type: 'city', parentId: 'zone', allParentIds: ['root', 'zone'] });
      await raw.insertOne({ _id: 'c2', name: 'City 2', type: 'city', parentId: 'zone', allParentIds: ['root', 'zone'] });
      await raw.insertOne({ _id: 'm1', name: 'M1', type: 'mehfil', parentId: 'c1', allParentIds: ['root', 'zone', 'c1'] });
      await raw.insertOne({ _id: 'm2', name: 'M2', type: 'mehfil', parentId: 'c1', allParentIds: ['root', 'zone', 'c1'] });
      await raw.insertOne({ _id: 'm3', name: 'M3', type: 'mehfil', parentId: 'c2', allParentIds: ['root', 'zone', 'c2'] });
      await addKarkun('in-m1', 'm1');
      await addKarkun('in-m2', 'm2');
      await addKarkun('in-m3', 'm3');
      await insert(People, {
        _id: 'city-only',
        isKarkun: true,
        sharedData: { name: 'city-only' },
        karkunData: { cityLocationId: 'c1' },
      });
      await insert(People, {
        _id: 'no-location',
        isKarkun: true,
        sharedData: { name: 'no-location' },
        karkunData: {},
      });
    };
    const ids = async (locationId: string) =>
      (await listOrgLocationKarkuns({ locationId, includeChildLocations: true })).data.map(
        row => row._id
      );

    it('lists a city\'s own karkuns and those of its mehfils', async () => {
      await seedTree();
      expect(await ids('c1')).toEqual(['city-only', 'in-m1', 'in-m2']);
    });

    it('lists a mehfil\'s karkuns alone', async () => {
      await seedTree();
      expect(await ids('m1')).toEqual(['in-m1']);
    });

    it('lists everyone for the root, even karkuns with no location', async () => {
      await seedTree();
      expect(await ids('root')).toEqual([
        'city-only',
        'in-m1',
        'in-m2',
        'in-m3',
        'no-location',
      ]);
    });

    it('stays with the mehfil alone when not asked for the locations below', async () => {
      await seedTree();
      const result = await listOrgLocationKarkuns({ locationId: 'c1' });
      expect(result.totalResults).toBe(0);
    });
  });
});
