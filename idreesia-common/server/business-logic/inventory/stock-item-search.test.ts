import { beforeEach, describe, expect, it } from 'vitest';

import { StockItems } from 'meteor/idreesia-common/server/collections/inventory';

import { getPagedStockItems } from './stock-item-search';

const monthsAgo = (months: number) => {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return date;
};

const seed = (docs: Record<string, unknown>[]) =>
  (StockItems as any).rawCollection().insertMany(
    docs.map(doc => ({ physicalStoreId: 's1', ...doc })) as never
  );
const names = (result: { data: any[] }) =>
  result.data.map(item => item.name as string);

beforeEach(async () => {
  // Names of two or more letters are searched with a text index.
  await StockItems.rawCollection().createIndex({ name: 'text' });
});

describe('getPagedStockItems', () => {
  it('only returns the items of the store, sorted by name', async () => {
    await seed([
      { _id: '1', name: 'Rice' },
      { _id: '2', name: 'Atta' },
      { _id: '3', name: 'Sugar', physicalStoreId: 's2' },
    ]);

    const result = await getPagedStockItems('', 's1');
    expect(names(result)).toEqual(['Atta', 'Rice']);
    expect(result.totalResults).toBe(2);
  });

  it('filters on category', async () => {
    await seed([
      { _id: '1', name: 'Rice', categoryId: 'c1' },
      { _id: '2', name: 'Atta', categoryId: 'c2' },
    ]);
    expect(names(await getPagedStockItems('categoryId=c2', 's1'))).toEqual([
      'Atta',
    ]);
  });

  describe('by name', () => {
    beforeEach(async () => {
      await seed([
        { _id: '1', name: 'Basmati Rice' },
        { _id: '2', name: 'Brown Rice' },
        { _id: '3', name: 'Sugar' },
      ]);
    });

    it('matches a word of the name for two or more letters', async () => {
      expect(names(await getPagedStockItems('name=rice', 's1'))).toEqual([
        'Basmati Rice',
        'Brown Rice',
      ]);
    });

    it('matches the first letter for one letter', async () => {
      expect(names(await getPagedStockItems('name=B', 's1'))).toEqual([
        'Basmati Rice',
        'Brown Rice',
      ]);
    });

    it('keeps the store filter on a text match', async () => {
      await seed([{ _id: '4', name: 'Rice Flour', physicalStoreId: 's2' }]);
      expect(names(await getPagedStockItems('name=rice', 's1'))).toEqual([
        'Basmati Rice',
        'Brown Rice',
      ]);
    });
  });

  describe('by stock level', () => {
    beforeEach(async () => {
      await seed([
        { _id: '1', name: 'Negative', currentStockLevel: -2, minStockLevel: 5 },
        { _id: '2', name: 'Low', currentStockLevel: 3, minStockLevel: 5 },
        { _id: '3', name: 'Fine', currentStockLevel: 9, minStockLevel: 5 },
        { _id: '4', name: 'NoMin', currentStockLevel: 1 },
        { _id: '5', name: 'Equal', currentStockLevel: 5, minStockLevel: 5 },
      ]);
    });

    it('finds negative stock', async () => {
      expect(
        names(await getPagedStockItems('stockLevel=negative-stock-level', 's1'))
      ).toEqual(['Negative']);
    });

    it('finds stock below the minimum, ignoring items without one', async () => {
      expect(
        names(
          await getPagedStockItems('stockLevel=less-than-min-stock-level', 's1')
        )
      ).toEqual(['Low', 'Negative']);
    });
  });

  describe('by verification age', () => {
    beforeEach(async () => {
      await seed([
        { _id: '1', name: 'Recent', verifiedOn: monthsAgo(1) },
        { _id: '2', name: 'Mid', verifiedOn: monthsAgo(4) },
        { _id: '3', name: 'Old', verifiedOn: monthsAgo(8) },
        { _id: '4', name: 'Never' },
      ]);
    });

    it.each([
      ['less-than-3-months-ago', ['Recent']],
      ['between-3-to-6-months-ago', ['Mid']],
      ['more-than-6-months-ago', ['Never', 'Old']],
    ])('%s', async (duration, expected) => {
      expect(
        names(await getPagedStockItems(`verifyDuration=${duration}`, 's1'))
      ).toEqual(expected);
    });
  });

  it('pages by distinct name, keeping same-named items together', async () => {
    await seed([
      { _id: '1', name: 'A' },
      { _id: '2', name: 'B', company: 'x' },
      { _id: '3', name: 'B', company: 'y' },
      { _id: '4', name: 'C' },
    ]);

    const page0 = await getPagedStockItems('pageIndex=0&pageSize=2', 's1');
    expect(names(page0)).toEqual(['A', 'B', 'B']);
    expect(page0.totalResults).toBe(3);

    const page1 = await getPagedStockItems('pageIndex=1&pageSize=2', 's1');
    expect(names(page1)).toEqual(['C']);
  });

  it('returns nothing past the last page', async () => {
    await seed([{ _id: '1', name: 'A' }]);
    expect(
      await getPagedStockItems('pageIndex=3&pageSize=2', 's1')
    ).toEqual({ data: [], totalResults: 1 });
  });
});
