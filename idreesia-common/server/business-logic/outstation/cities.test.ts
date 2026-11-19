import { describe, expect, it, vi } from 'vitest';

import { People } from 'meteor/idreesia-common/server/collections/common';
import { Cities, CityMehfils } from 'meteor/idreesia-common/server/collections/outstation';

import { canSafelyDeleteCity, deleteCity, searchCities } from './index';

const addCity = (_id: string, name: string, extra: Record<string, unknown> = {}) =>
  (Cities.rawCollection() as any).insertOne({ _id, name, ...extra } as any);

describe('searchCities', () => {
  const seed = async () => {
    await addCity('c1', 'Lahore', { region: 'Punjab' });
    await addCity('c2', 'Karachi', { region: 'Sindh' });
    await addCity('c3', 'Kasur', { region: 'Punjab', peripheryOf: 'c1' });
    await addCity('c4', 'Multan', { region: 'Punjab' });
  };

  it('returns all cities sorted by name with the total', async () => {
    await seed();
    const { data, totalResults } = await searchCities({});
    expect(data.map(c => c.name)).toEqual(['Karachi', 'Kasur', 'Lahore', 'Multan']);
    expect(totalResults).toBe(4);
  });

  it('filters by region and by periphery', async () => {
    await seed();
    expect((await searchCities({ region: 'Punjab' })).data.map(c => c._id)).toEqual([
      'c3',
      'c1',
      'c4',
    ]);
    const periphery = await searchCities({ peripheryOf: 'c1' });
    expect(periphery.data.map(c => c._id)).toEqual(['c3']);
    expect(periphery.totalResults).toBe(1);
    expect((await searchCities({ region: 'Sindh', peripheryOf: 'c1' })).totalResults).toBe(0);
  });

  it('pages the results but counts all matches', async () => {
    await seed();
    const page = await searchCities({ pageIndex: '1', pageSize: '2' });
    expect(page.data.map(c => c.name)).toEqual(['Lahore', 'Multan']);
    expect(page.totalResults).toBe(4);
    expect((await searchCities({ pageIndex: '5', pageSize: '2' })).data).toEqual([]);
  });

  it('reports a zero total for no matches', async () => {
    expect(await searchCities({ region: 'Nowhere' })).toEqual({ data: [], totalResults: 0 });
  });
});

describe('canSafelyDeleteCity and deleteCity', () => {
  it('allows deleting a city nothing refers to', async () => {
    await addCity('c1', 'Lahore');
    expect(await canSafelyDeleteCity('c1')).toBe(true);
    expect(await deleteCity('c1')).toBe(1);
    expect(await Cities.findOneAsync('c1')).toBeUndefined();
  });

  it('refuses a city that has a mehfil', async () => {
    await addCity('c1', 'Lahore');
    await (CityMehfils.rawCollection() as any).insertOne({ _id: 'm1', cityId: 'c1' } as any);
    expect(await canSafelyDeleteCity('c1')).toBe(false);
    await expect(deleteCity('c1')).rejects.toThrow('cannot be deleted');
    expect(await Cities.findOneAsync('c1')).toBeDefined();
  });

  it('refuses a city that has a karkun', async () => {
    await addCity('c1', 'Lahore');
    await (People.rawCollection() as any).insertOne({ _id: 'p1', karkunData: { cityId: 'c1' } } as any);
    expect(await canSafelyDeleteCity('c1')).toBe(false);
    await expect(deleteCity('c1')).rejects.toThrow('cannot be deleted');
  });

  it('is not blocked by records of other cities', async () => {
    await addCity('c1', 'Lahore');
    await (CityMehfils.rawCollection() as any).insertOne({ _id: 'm1', cityId: 'c2' } as any);
    expect(await canSafelyDeleteCity('c1')).toBe(true);
  });

  it('keeps the city when the delete itself fails', async () => {
    await addCity('c1', 'Lahore');
    vi.spyOn(Cities, 'removeAsync').mockRejectedValueOnce(new Error('db down'));
    await expect(deleteCity('c1')).rejects.toThrow('db down');
    expect(await Cities.findOneAsync('c1')).toBeDefined();
  });
});
