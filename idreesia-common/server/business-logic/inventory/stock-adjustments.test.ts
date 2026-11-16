import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  StockAdjustments,
  StockItems,
} from 'meteor/idreesia-common/server/collections/inventory';

import {
  createStockAdjustment,
  removeStockAdjustments,
  updateStockAdjustment,
} from './stock-adjustments';

afterEach(() => {
  vi.restoreAllMocks();
});

const level = async (_id: string) =>
  (await StockItems.findOneAsync(_id))?.currentStockLevel;
const item = (_id: string, currentStockLevel: number) =>
  StockItems.insertAsync({ _id, currentStockLevel });
const adjustment = (id: string) => StockAdjustments.findOneAsync(id) as any;

describe('stock adjustments', () => {
  it.each([
    ['increase', true, 14],
    ['decrease', false, 6],
    ['decrease when direction is missing', undefined, 6],
  ])('applies an %s to the level', async (_label, isInflow, expected) => {
    await item('i1', 10);
    const id = await createStockAdjustment(
      's1',
      'i1',
      { quantity: 4, isInflow, adjustmentReason: 'count' },
      'u1'
    );

    expect(await level('i1')).toBe(expected);
    expect(await adjustment(id)).toMatchObject({
      physicalStoreId: 's1',
      stockItemId: 'i1',
      quantity: 4,
      adjustmentReason: 'count',
      createdBy: 'u1',
      updatedBy: 'u1',
    });
  });

  it('can take the level below zero', async () => {
    await item('i1', 1);
    await createStockAdjustment('s1', 'i1', { quantity: 5 }, 'u1');
    expect(await level('i1')).toBe(-4);
  });

  it('rolls the adjustment back when the level cannot be changed', async () => {
    await item('i1', 10);
    vi.spyOn(StockItems, 'updateAsync').mockRejectedValueOnce(
      new Error('stock failed')
    );

    await expect(
      createStockAdjustment('s1', 'i1', { quantity: 4, isInflow: true }, 'u1')
    ).rejects.toThrow('stock failed');

    expect(await StockAdjustments.find({}).countAsync()).toBe(0);
    expect(await level('i1')).toBe(10);
  });

  describe('updating', () => {
    it('moves the level from the old adjustment to the new one', async () => {
      await item('i1', 10);
      const id = await createStockAdjustment(
        's1',
        'i1',
        { quantity: 4, isInflow: true },
        'u1'
      );
      expect(await level('i1')).toBe(14);

      await updateStockAdjustment(id, 's1', { quantity: 2, isInflow: false }, 'u2');

      expect(await level('i1')).toBe(8);
      expect(await adjustment(id)).toMatchObject({
        quantity: 2,
        isInflow: false,
        updatedBy: 'u2',
        createdBy: 'u1',
      });
    });

    it('rejects an adjustment of another store', async () => {
      await item('i1', 10);
      const id = await createStockAdjustment(
        's1',
        'i1',
        { quantity: 4, isInflow: true },
        'u1'
      );

      await expect(
        updateStockAdjustment(id, 'other-store', { quantity: 1 }, 'u2')
      ).rejects.toThrow('Stock adjustment not found.');

      expect(await level('i1')).toBe(14);
    });

    it('rejects an adjustment that does not exist', async () => {
      await expect(
        updateStockAdjustment('missing', 's1', { quantity: 1 }, 'u1')
      ).rejects.toThrow('Stock adjustment not found.');
    });

    it('rejects an approved adjustment and leaves the level alone', async () => {
      await item('i1', 10);
      const id = await createStockAdjustment(
        's1',
        'i1',
        { quantity: 4, isInflow: true },
        'u1'
      );
      await (StockAdjustments as any).rawCollection().updateOne(
        { _id: id },
        { $set: { approvedOn: new Date(), approvedBy: 'u9' } }
      );

      await expect(
        updateStockAdjustment(id, 's1', { quantity: 9, isInflow: true }, 'u2')
      ).rejects.toThrow('already approved');

      expect(await level('i1')).toBe(14);
      expect((await adjustment(id)).quantity).toBe(4);
    });

    it('rolls the level back when the write fails', async () => {
      await item('i1', 10);
      const id = await createStockAdjustment(
        's1',
        'i1',
        { quantity: 4, isInflow: true },
        'u1'
      );
      vi.spyOn(StockAdjustments, 'updateAsync').mockRejectedValueOnce(
        new Error('write failed')
      );

      await expect(
        updateStockAdjustment(id, 's1', { quantity: 1, isInflow: true }, 'u2')
      ).rejects.toThrow('write failed');

      expect(await level('i1')).toBe(14);
    });
  });

  describe('removing', () => {
    it('reverts the unapproved adjustments of the store and deletes them', async () => {
      await item('i1', 10);
      await item('i2', 10);
      const a = await createStockAdjustment(
        's1',
        'i1',
        { quantity: 4, isInflow: true },
        'u1'
      );
      const b = await createStockAdjustment('s1', 'i2', { quantity: 3 }, 'u1');

      expect(await removeStockAdjustments('s1', [a, b])).toBe(2);

      expect(await level('i1')).toBe(10);
      expect(await level('i2')).toBe(10);
      expect(await StockAdjustments.find({}).countAsync()).toBe(0);
    });

    it('ignores adjustments of another store', async () => {
      await item('i1', 10);
      const id = await createStockAdjustment(
        's2',
        'i1',
        { quantity: 4, isInflow: true },
        'u1'
      );

      expect(await removeStockAdjustments('s1', [id])).toBe(0);

      expect(await level('i1')).toBe(14);
      expect(await adjustment(id)).toBeDefined();
    });

    it('rolls the levels back when the delete fails', async () => {
      await item('i1', 10);
      const id = await createStockAdjustment(
        's1',
        'i1',
        { quantity: 4, isInflow: true },
        'u1'
      );
      vi.spyOn(StockAdjustments, 'removeAsync').mockRejectedValueOnce(
        new Error('delete failed')
      );

      await expect(removeStockAdjustments('s1', [id])).rejects.toThrow(
        'delete failed'
      );

      expect(await level('i1')).toBe(14);
    });
  });
});
