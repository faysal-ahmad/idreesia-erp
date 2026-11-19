import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  IssuanceForms,
  StockItems,
} from 'meteor/idreesia-common/server/collections/inventory';

import { createIssuanceForm, updateIssuanceForm } from './issuance-forms';

// A form and the stock levels it changes are one transaction.

afterEach(() => {
  vi.restoreAllMocks();
});

const stockLevel = async (_id: string) =>
  (await StockItems.findOneAsync(_id))?.currentStockLevel;

const newItem = (_id: string, currentStockLevel: number) =>
  StockItems.insertAsync({ _id, currentStockLevel });

const formInput = (items: { stockItemId: string; quantity: number }[]) => ({
  issueDate: new Date(),
  issuedBy: 'p1',
  issuedTo: 'p2',
  physicalStoreId: 's1',
  items,
});

describe('inventory transactions', () => {
  it('counts every line, even when a form lists an item twice', async () => {
    await newItem('i1', 10);

    await createIssuanceForm(
      formInput([
        { stockItemId: 'i1', quantity: 2 },
        { stockItemId: 'i1', quantity: 3 },
      ]),
      'u1'
    );

    expect(await stockLevel('i1')).toBe(5);
  });

  it('keeps the stock levels when the form cannot be saved', async () => {
    await newItem('i1', 10);
    vi.spyOn(IssuanceForms, 'insertAsync').mockImplementationOnce(async () => {
      // The stock change is made first here, then the form fails.
      await StockItems.updateAsync('i1', { $inc: { currentStockLevel: -4 } });
      throw new Error('form insert failed');
    });

    await expect(
      createIssuanceForm(formInput([{ stockItemId: 'i1', quantity: 4 }]), 'u1')
    ).rejects.toThrow('form insert failed');

    expect(await stockLevel('i1')).toBe(10);
  });

  it('leaves the stock levels alone when the form was approved meanwhile', async () => {
    await newItem('i1', 10);
    const formId = await createIssuanceForm(
      formInput([{ stockItemId: 'i1', quantity: 4 }]),
      'u1'
    );
    // Approved after it was read for the update, but before it is written.
    const originalUpdate = IssuanceForms.updateAsync.bind(IssuanceForms);
    vi.spyOn(IssuanceForms, 'updateAsync').mockImplementationOnce(
      async (selector: unknown, modifier: unknown, options?: unknown) => {
        await IssuanceForms.rawCollection().updateMany(
          { _id: formId },
          { $set: { approvedOn: new Date(), approvedBy: 'u9' } }
        );
        return originalUpdate(selector, modifier, options);
      }
    );

    await expect(
      updateIssuanceForm(
        formId,
        's1',
        formInput([{ stockItemId: 'i1', quantity: 7 }]),
        'u1'
      )
    ).rejects.toThrow('already approved');

    expect(await stockLevel('i1')).toBe(6);
  });
});
