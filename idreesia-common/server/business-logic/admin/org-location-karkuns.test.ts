import { describe, expect, it } from 'vitest';

import { People } from 'meteor/idreesia-common/server/collections/common';
import { Users } from 'meteor/idreesia-common/server/collections/admin';

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
});
