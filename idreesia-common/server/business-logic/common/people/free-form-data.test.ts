import { describe, expect, it } from 'vitest';

import { People } from 'meteor/idreesia-common/server/collections/common';

import { pagedFreeFormValues } from './free-form-data';

type Doc = Record<string, unknown>;

const addPerson = (_id: string, visitorData: Doc, extra: Doc = {}) =>
  (
    People.rawCollection() as unknown as {
      insertOne(d: Doc): Promise<unknown>;
    }
  ).insertOne({ _id, sharedData: { name: _id }, visitorData, ...extra });

describe('pagedFreeFormValues', () => {
  it('lists distinct values alphabetically (case-insensitive) with counts', async () => {
    await addPerson('a', { city: 'lahore' });
    await addPerson('b', { city: 'Karachi' });
    await addPerson('c', { city: 'Karachi' });
    await addPerson('d', { city: 'Abbottabad' });

    const page = await pagedFreeFormValues('city', 0, 10);
    expect(page.totalResults).toBe(3);
    expect(page.data).toEqual([
      { name: 'Abbottabad', count: 1 },
      { name: 'Karachi', count: 2 },
      { name: 'lahore', count: 1 },
    ]);
  });

  it('keeps spellings that differ only by case as separate values', async () => {
    await addPerson('a', { city: 'lahore' });
    await addPerson('b', { city: 'Lahore' });
    await addPerson('c', { city: 'Lahore' });

    const page = await pagedFreeFormValues('city', 0, 10);
    expect(page.totalResults).toBe(2);
    expect(page.data).toEqual([
      { name: 'Lahore', count: 2 },
      { name: 'lahore', count: 1 },
    ]);
  });

  it('reads the country field for countries', async () => {
    await addPerson('a', { city: 'Karachi', country: 'Pakistan' });
    expect(await pagedFreeFormValues('country', 0, 10)).toEqual({
      totalResults: 1,
      data: [{ name: 'Pakistan', count: 1 }],
    });
  });

  it('skips blanks, missing values and deleted people', async () => {
    await addPerson('a', { city: '' });
    await addPerson('b', {});
    await addPerson('c', { city: 'Karachi' }, { deletedAt: new Date() });
    await addPerson('d', { city: 'Lahore' });

    const page = await pagedFreeFormValues('city', 0, 10);
    expect(page.data.map(row => row.name)).toEqual(['Lahore']);
  });

  it('pages the results and reports the full total', async () => {
    await addPerson('a', { city: 'A' });
    await addPerson('b', { city: 'B' });
    await addPerson('c', { city: 'C' });

    const second = await pagedFreeFormValues('city', 1, 2);
    expect(second.totalResults).toBe(3);
    expect(second.data.map(row => row.name)).toEqual(['C']);
  });

  it('returns an empty page when nothing matches', async () => {
    expect(await pagedFreeFormValues('city', 0, 10)).toEqual({
      totalResults: 0,
      data: [],
    });
  });
});
