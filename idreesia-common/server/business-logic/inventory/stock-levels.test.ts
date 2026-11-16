import { describe, expect, it } from 'vitest';

import { StockItems } from 'meteor/idreesia-common/server/collections/inventory';

import {
  applyStockMovements,
  decrementStockLevel,
  incrementStockLevel,
  revertStockMovements,
} from './stock-levels';

const level = async (_id: string) =>
  (await StockItems.findOneAsync(_id))?.currentStockLevel;

const item = (_id: string, currentStockLevel: number) =>
  StockItems.insertAsync({ _id, currentStockLevel });

describe('stock levels', () => {
  it('increments and decrements a level', async () => {
    await item('i1', 10);
    await incrementStockLevel('i1', 5);
    expect(await level('i1')).toBe(15);
    await decrementStockLevel('i1', 20);
    expect(await level('i1')).toBe(-5); // negative stock is allowed
  });

  it.each([
    ['an outflow lowers the level', false, 7],
    ['an inflow raises the level', true, 13],
  ])('applies movements: %s', async (_label, isInflow, expected) => {
    await item('i1', 10);
    await applyStockMovements([{ stockItemId: 'i1', quantity: 3, isInflow }]);
    expect(await level('i1')).toBe(expected);
  });

  it('treats a movement without a direction as an outflow', async () => {
    await item('i1', 10);
    await applyStockMovements([{ stockItemId: 'i1', quantity: 3 }]);
    expect(await level('i1')).toBe(7);
  });

  it('reverts movements, undoing apply exactly', async () => {
    await item('i1', 10);
    await item('i2', 0);
    const movements = [
      { stockItemId: 'i1', quantity: 4, isInflow: true },
      { stockItemId: 'i1', quantity: 1 },
      { stockItemId: 'i2', quantity: 6 },
    ];
    await applyStockMovements(movements);
    expect(await level('i1')).toBe(13);
    expect(await level('i2')).toBe(-6);

    await revertStockMovements(movements);
    expect(await level('i1')).toBe(10);
    expect(await level('i2')).toBe(0);
  });

  it('does nothing for no movements and ignores unknown items', async () => {
    await applyStockMovements([]);
    await expect(
      applyStockMovements([{ stockItemId: 'nope', quantity: 1 }])
    ).resolves.toBeUndefined();
    expect(await StockItems.find({}).countAsync()).toBe(0);
  });
});
