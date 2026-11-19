import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  IssuanceForms,
  PurchaseForms,
  StockAdjustments,
  StockItems,
} from 'meteor/idreesia-common/server/collections/inventory';
import * as storage from 'meteor/idreesia-common/server/file-storage';

import {
  mergeStockItems,
  recalculateStockLevels,
  removeStockItem,
} from './stock-item-maintenance';

vi.mock('meteor/idreesia-common/server/file-storage', async () =>
  import('meteor/idreesia-common/server/test-utils/file-storage-mock')
);

const deleteFiles = vi.mocked(storage.deleteFiles);

// Meteor's cursors have forEachAsync; the unit-test stand-in does not.
beforeAll(() => {
  const proto = Object.getPrototypeOf(StockItems.find({}));
  if (!proto.forEachAsync) {
    proto.forEachAsync = async function forEachAsync(
      this: { fetchAsync(): Promise<unknown[]> },
      callback: (doc: unknown) => unknown
    ) {
      for (const doc of await this.fetchAsync()) await callback(doc);
    };
  }
});

beforeEach(() => {
  deleteFiles.mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

const store = 's1';
const item = (_id: string, extra: Record<string, unknown> = {}) =>
  StockItems.insertAsync({ _id, physicalStoreId: store, ...extra });
const level = async (_id: string) =>
  (await StockItems.findOneAsync(_id))?.currentStockLevel;
const issuance = (
  _id: string,
  items: Record<string, unknown>[],
  physicalStoreId = store
) => IssuanceForms.insertAsync({ _id, physicalStoreId, items });
const purchase = (
  _id: string,
  items: Record<string, unknown>[],
  physicalStoreId = store
) => PurchaseForms.insertAsync({ _id, physicalStoreId, items });
const adjustment = (
  _id: string,
  stockItemId: string,
  quantity: number,
  isInflow?: boolean,
  physicalStoreId = store
) =>
  StockAdjustments.insertAsync({
    _id,
    physicalStoreId,
    stockItemId,
    quantity,
    isInflow,
  });

describe('recalculateStockLevels', () => {
  it('rebuilds the level from the starting level, forms and adjustments', async () => {
    await item('i1', { startingStockLevel: 100, currentStockLevel: 999 });
    await item('i2', { startingStockLevel: 0 });
    await issuance('is1', [
      { stockItemId: 'i1', quantity: 10 }, // issued
      { stockItemId: 'i1', quantity: 2, isInflow: true }, // returned
      { stockItemId: 'i2', quantity: 50 }, // other item
    ]);
    await purchase('p1', [{ stockItemId: 'i1', quantity: 30, isInflow: true }]);
    await adjustment('a1', 'i1', 5, false);
    await adjustment('a2', 'i1', 1, true);

    await recalculateStockLevels('i1', store);

    expect(await level('i1')).toBe(100 - 10 + 2 + 30 - 5 + 1);
    expect(await level('i2')).toBeUndefined();
  });

  it('starts from zero without a starting level and can end negative', async () => {
    await item('i1');
    await issuance('is1', [{ stockItemId: 'i1', quantity: 4 }]);

    await recalculateStockLevels('i1', store);

    expect(await level('i1')).toBe(-4);
  });

  it('ignores forms and adjustments of another store', async () => {
    await item('i1', { startingStockLevel: 10 });
    await issuance('is1', [{ stockItemId: 'i1', quantity: 4 }], 's2');
    await purchase('p1', [{ stockItemId: 'i1', quantity: 4 }], 's2');
    await adjustment('a1', 'i1', 4, true, 's2');

    await recalculateStockLevels('i1', store);

    expect(await level('i1')).toBe(10);
  });
});

describe('mergeStockItems', () => {
  const seedMergeCase = async () => {
    await item('keep', { startingStockLevel: 10, currentStockLevel: 7 });
    await item('dup1', { startingStockLevel: 5, currentStockLevel: 5 });
    await item('dup2', {
      startingStockLevel: 1,
      currentStockLevel: 1,
      imageKey: 'stock-item-images/dup2/x.jpg',
    });
    await issuance('is1', [
      { stockItemId: 'dup1', quantity: 2 },
      { stockItemId: 'keep', quantity: 1 },
    ]);
    await purchase('p1', [{ stockItemId: 'dup2', quantity: 4, isInflow: true }]);
    await adjustment('a1', 'dup1', 3, true);
  };

  it('moves references to the kept item, sums starting levels and recalculates', async () => {
    await seedMergeCase();

    await mergeStockItems('keep', ['dup1', 'dup2'], store);

    const issued = (await IssuanceForms.findOneAsync('is1')) as any;
    expect(issued.items.map((i: any) => i.stockItemId)).toEqual([
      'keep',
      'keep',
    ]);
    const bought = (await PurchaseForms.findOneAsync('p1')) as any;
    expect(bought.items[0].stockItemId).toBe('keep');
    expect(((await StockAdjustments.findOneAsync('a1')) as any).stockItemId).toBe(
      'keep'
    );
    const kept = (await StockItems.findOneAsync('keep')) as any;
    expect(kept.startingStockLevel).toBe(16);
    expect(kept.currentStockLevel).toBe(16 - 2 - 1 + 4 + 3);
    expect(await StockItems.findOneAsync('dup1')).toBeUndefined();
    expect(await StockItems.findOneAsync('dup2')).toBeUndefined();
  });

  it('deletes the image files of the merged items, not of the kept one', async () => {
    await seedMergeCase();
    await StockItems.updateAsync('keep', { $set: { imageKey: 'keep.jpg' } });

    await mergeStockItems('keep', ['dup1', 'dup2'], store);

    expect(deleteFiles).toHaveBeenCalledTimes(1);
    expect(deleteFiles).toHaveBeenCalledWith(['stock-item-images/dup2/x.jpg']);
  });

  it('leaves everything as it was, and keeps the files, when the delete fails', async () => {
    await seedMergeCase();
    vi.spyOn(StockItems, 'removeAsync').mockRejectedValueOnce(
      new Error('delete failed')
    );

    await expect(mergeStockItems('keep', ['dup1', 'dup2'], store)).rejects.toThrow(
      'delete failed'
    );

    const issued = (await IssuanceForms.findOneAsync('is1')) as any;
    expect(issued.items[0].stockItemId).toBe('dup1');
    expect(((await StockAdjustments.findOneAsync('a1')) as any).stockItemId).toBe(
      'dup1'
    );
    const kept = (await StockItems.findOneAsync('keep')) as any;
    expect(kept.startingStockLevel).toBe(10);
    expect(kept.currentStockLevel).toBe(7);
    expect(await StockItems.findOneAsync('dup1')).toBeDefined();
    expect(deleteFiles).not.toHaveBeenCalled();
  });

  it('does not rewrite forms of another store', async () => {
    await seedMergeCase();
    await issuance('other', [{ stockItemId: 'dup1', quantity: 1 }], 's2');

    await mergeStockItems('keep', ['dup1', 'dup2'], store);

    const other = (await IssuanceForms.findOneAsync('other')) as any;
    expect(other.items[0].stockItemId).toBe('dup1');
  });
});

describe('removeStockItem', () => {
  it('removes an unused item and its image', async () => {
    await item('i1', { imageKey: 'a.jpg' });

    expect(await removeStockItem('i1', store)).toBe(1);

    expect(await StockItems.findOneAsync('i1')).toBeUndefined();
    expect(deleteFiles).toHaveBeenCalledWith(['a.jpg']);
  });

  it.each([
    ['an issuance form', () => issuance('f', [{ stockItemId: 'i1', quantity: 1 }])],
    ['a purchase form', () => purchase('f', [{ stockItemId: 'i1', quantity: 1 }])],
    ['a stock adjustment', () => adjustment('f', 'i1', 1)],
  ])('keeps an item that %s refers to', async (_label, makeUsage) => {
    await item('i1', { imageKey: 'a.jpg' });
    await makeUsage();

    expect(await removeStockItem('i1', store)).toBe(0);

    expect(await StockItems.findOneAsync('i1')).toBeDefined();
    expect(deleteFiles).not.toHaveBeenCalled();
  });

  it('does not remove an item of another store', async () => {
    await item('i1');
    expect(await removeStockItem('i1', 's2')).toBe(0);
    expect(await StockItems.findOneAsync('i1')).toBeDefined();
  });

  it('keeps the image when the delete fails', async () => {
    await item('i1', { imageKey: 'a.jpg' });
    vi.spyOn(StockItems, 'removeAsync').mockRejectedValueOnce(
      new Error('delete failed')
    );

    await expect(removeStockItem('i1', store)).rejects.toThrow('delete failed');

    expect(deleteFiles).not.toHaveBeenCalled();
  });
});
