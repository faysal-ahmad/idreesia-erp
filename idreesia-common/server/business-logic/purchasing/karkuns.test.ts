import { describe, expect, it } from 'vitest';

import { OrgLocations, Users } from 'meteor/idreesia-common/server/collections/admin';
import { People } from 'meteor/idreesia-common/server/collections/common';

import { searchPurchasingKarkuns } from './index';

type Doc = Record<string, unknown>;

// Fixtures go straight to the driver: these tests are about the filters.
const insert = (collection: { rawCollection(): unknown }, doc: Doc) =>
  (collection.rawCollection() as { insertOne(d: Doc): Promise<unknown> }).insertOne(doc);

const addKarkun = async (_id: string, cityLocationId: string, withAccount = true) => {
  await insert(People, {
    _id,
    sharedData: { name: _id },
    isKarkun: true,
    karkunData: { cityLocationId },
  });
  if (withAccount) await insert(Users, { _id: `user-${_id}`, personId: _id, username: _id });
};

describe('purchasing karkun search', () => {
  it('finds nobody when the city location does not exist', async () => {
    expect(await searchPurchasingKarkuns({})).toEqual({ data: [], totalResults: 0 });
  });

  it('lists the Multan karkuns that have a user account', async () => {
    await insert(OrgLocations, { _id: 'multan', name: 'multan', type: 'city' });
    await insert(OrgLocations, { _id: 'lahore', name: 'Lahore', type: 'city' });
    await addKarkun('k1', 'multan');
    await addKarkun('k2', 'multan');
    await addKarkun('k3', 'multan', false);
    await addKarkun('k4', 'lahore');

    const result = await searchPurchasingKarkuns({});
    expect(result.data.map((karkun) => karkun._id).sort()).toEqual(['k1', 'k2']);
    expect(result.totalResults).toBe(2);
  });
});
