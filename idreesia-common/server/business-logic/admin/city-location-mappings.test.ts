import { describe, expect, it } from 'vitest';

import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  CityLocationMappings,
  OrgLocations,
} from 'meteor/idreesia-common/server/collections/admin';

import {
  pagedFreeFormCities,
  updateCityLocationMappings,
} from './city-location-mappings';

type Doc = Record<string, unknown>;

const raw = (c: { rawCollection(): unknown }) =>
  c.rawCollection() as unknown as {
    insertOne(d: Doc): Promise<unknown>;
  };

const addPerson = (_id: string, city: string, extra: Doc = {}) =>
  raw(People).insertOne({
    _id,
    sharedData: { name: _id },
    visitorData: { city },
    ...extra,
  });
const addLocation = (_id: string, name: string) =>
  raw(OrgLocations).insertOne({ _id, name, type: 'MEHFIL' });
const mappings = async () =>
  (await CityLocationMappings.find({}).fetchAsync())
    .map(m => [m.city, m.locationId])
    .sort();

const user = { _id: 'u1' };

describe('updateCityLocationMappings', () => {
  it('maps cities to the location with the exact same name', async () => {
    await addPerson('p1', 'Lahore');
    await addPerson('p2', 'Karachi');
    await addLocation('l1', 'Lahore');

    expect(await updateCityLocationMappings(user)).toBe(1);
    expect(await mappings()).toEqual([['Lahore', 'l1']]);
  });

  it('matches case exactly', async () => {
    await addPerson('p1', 'lahore');
    await addLocation('l1', 'Lahore');

    expect(await updateCityLocationMappings(user)).toBe(0);
    expect(await mappings()).toEqual([]);
  });

  it('leaves a city alone when several locations share its name', async () => {
    await addPerson('p1', 'Lahore');
    await addLocation('l1', 'Lahore');
    await addLocation('l2', 'Lahore');

    expect(await updateCityLocationMappings(user)).toBe(0);
  });

  it('never changes an existing mapping and is repeatable', async () => {
    await addPerson('p1', 'Lahore');
    await addLocation('l1', 'Lahore');
    await addLocation('l2', 'Other');
    await CityLocationMappings.insertAsync({ city: 'Lahore', locationId: 'l2' });

    expect(await updateCityLocationMappings(user)).toBe(0);
    expect(await mappings()).toEqual([['Lahore', 'l2']]);
  });

  it('ignores deleted people and blank cities', async () => {
    await addPerson('p1', 'Lahore', { deletedAt: new Date() });
    await addPerson('p2', '');
    await addLocation('l1', 'Lahore');

    expect(await updateCityLocationMappings(user)).toBe(0);
  });
});

describe('pagedFreeFormCities', () => {
  it('adds the mapped location to each city', async () => {
    await addPerson('p1', 'Karachi');
    await addPerson('p2', 'Lahore');
    await addLocation('l1', 'Lahore HQ');
    await CityLocationMappings.insertAsync({ city: 'Lahore', locationId: 'l1' });

    const page = await pagedFreeFormCities(0, 10);
    expect(page.totalResults).toBe(2);
    expect(page.data).toEqual([
      { name: 'Karachi', count: 1, locationId: null, locationName: null },
      { name: 'Lahore', count: 1, locationId: 'l1', locationName: 'Lahore HQ' },
    ]);
  });
});
