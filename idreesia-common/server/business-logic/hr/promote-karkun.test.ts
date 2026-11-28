import { describe, expect, it } from 'vitest';

import { OrgLocations } from 'meteor/idreesia-common/server/collections/admin';
import { People } from 'meteor/idreesia-common/server/collections/common';

import { promoteToKarkun } from './promote-karkun';

type Doc = Record<string, unknown>;

const insert = (collection: { rawCollection(): unknown }, doc: Doc) =>
  (collection.rawCollection() as { insertOne(d: Doc): Promise<unknown> }).insertOne(doc);

const user = { _id: 'admin' };

const setUp = async () => {
  await insert(OrgLocations, { _id: 'multan', name: 'Multan', type: 'city' });
  await insert(OrgLocations, { _id: 'lahore', name: 'Lahore', type: 'city' });
  await insert(OrgLocations, {
    _id: 'm1',
    name: 'Mehfil 1',
    type: 'mehfil',
    parentId: 'multan',
  });
  await insert(People, {
    _id: 'v1',
    isVisitor: true,
    sharedData: { name: 'Visitor' },
    visitorData: { city: 'Okara', country: 'Pakistan' },
  });
};

describe('promoting a person to karkun', () => {
  it('sets the city and mehfil, and keeps the visitor city', async () => {
    await setUp();

    await promoteToKarkun('v1', { cityLocationId: 'multan', mehfilLocationId: 'm1' }, user);

    const person = await People.findOneAsync('v1');
    expect(person?.isKarkun).toBe(true);
    expect(person?.karkunData?.cityLocationId).toBe('multan');
    expect(person?.karkunData?.mehfilLocationId).toBe('m1');
    expect(person?.visitorData?.city).toBe('Okara');
  });

  it('needs only the city', async () => {
    await setUp();

    await promoteToKarkun('v1', { cityLocationId: 'lahore' }, user);

    const person = await People.findOneAsync('v1');
    expect(person?.karkunData?.cityLocationId).toBe('lahore');
    expect(person?.karkunData?.mehfilLocationId).toBeUndefined();
  });

  it('refuses a mehfil of another city, or a location that is not a city', async () => {
    await setUp();

    await expect(
      promoteToKarkun('v1', { cityLocationId: 'lahore', mehfilLocationId: 'm1' }, user)
    ).rejects.toThrow('The mehfil is not in the selected city.');
    await expect(promoteToKarkun('v1', { cityLocationId: 'm1' }, user)).rejects.toThrow(
      'Please select a city.'
    );
    expect((await People.findOneAsync('v1'))?.isKarkun).toBeUndefined();
  });

  it('refuses someone who is already a karkun', async () => {
    await setUp();
    await insert(People, { _id: 'k1', isKarkun: true, sharedData: { name: 'Karkun' } });

    await expect(promoteToKarkun('k1', { cityLocationId: 'multan' }, user)).rejects.toThrow(
      'This person is already a karkun.'
    );
  });
});
