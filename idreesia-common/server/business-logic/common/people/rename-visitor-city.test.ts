import { describe, expect, it } from 'vitest';

import { People } from 'meteor/idreesia-common/server/collections/common';
import { CityLocationMappings } from 'meteor/idreesia-common/server/collections/admin';
import { Cities } from 'meteor/idreesia-common/server/collections/outstation';

import { renameVisitorCity } from './rename-visitor-city';

type Doc = Record<string, unknown>;

const raw = (c: { rawCollection(): unknown }) =>
  c.rawCollection() as unknown as {
    insertOne(d: Doc): Promise<unknown>;
    findOne(q: Doc): Promise<Doc | null>;
  };

const addPerson = (_id: string, city: string) =>
  raw(People).insertOne({
    _id,
    sharedData: { name: _id },
    visitorData: { city },
  });

const cityOf = async (_id: string) =>
  ((await raw(People).findOne({ _id }))?.visitorData as Doc).city;

describe('renameVisitorCity', () => {
  it('renames the city on every matching person only', async () => {
    await addPerson('a', 'Lahor');
    await addPerson('b', 'Lahor');
    await addPerson('c', 'Karachi');

    const count = await renameVisitorCity('Lahor', ' Lahore ', { _id: 'u1' });

    expect(count).toBe(2);
    expect(await cityOf('a')).toBe('Lahore');
    expect(await cityOf('b')).toBe('Lahore');
    expect(await cityOf('c')).toBe('Karachi');
    expect((await raw(People).findOne({ _id: 'a' }))?.updatedBy).toBe('u1');
  });

  it('refuses a city that exists in the Outstation list', async () => {
    await raw(Cities).insertOne({ _id: 'c1', name: 'Lahore' });
    await addPerson('a', 'Lahore');

    await expect(
      renameVisitorCity('Lahore', 'Lahor', { _id: 'u1' })
    ).rejects.toMatchObject({ extensions: { code: 'CONFLICT' } });
    expect(await cityOf('a')).toBe('Lahore');
  });

  it('refuses an empty new name', async () => {
    await addPerson('a', 'Lahor');
    await expect(
      renameVisitorCity('Lahor', '  ', { _id: 'u1' })
    ).rejects.toMatchObject({ extensions: { code: 'BAD_USER_INPUT' } });
  });

  it('moves the location mapping to the new spelling', async () => {
    await addPerson('a', 'Lahor');
    await CityLocationMappings.insertAsync({ city: 'Lahor', locationId: 'l1' });

    await renameVisitorCity('Lahor', 'Lahore', { _id: 'u1' });

    const all = await CityLocationMappings.find({}).fetchAsync();
    expect(all.map(m => [m.city, m.locationId])).toEqual([['Lahore', 'l1']]);
  });

  it('keeps the new spelling\'s own mapping when both have one', async () => {
    await addPerson('a', 'Lahor');
    await CityLocationMappings.insertAsync({ city: 'Lahor', locationId: 'l1' });
    await CityLocationMappings.insertAsync({ city: 'Lahore', locationId: 'l2' });

    await renameVisitorCity('Lahor', 'Lahore', { _id: 'u1' });

    const all = await CityLocationMappings.find({}).fetchAsync();
    expect(all.map(m => [m.city, m.locationId])).toEqual([['Lahore', 'l2']]);
  });
});
