import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import { StockAdjustments } from 'meteor/idreesia-common/server/collections/inventory';

import { applyStockMovements, revertStockMovements } from './stock-levels';

/*
 * Stock adjustments correct one item's stock level. An adjustment and the
 * stock level it changes are written in one transaction.
 */

export interface StockAdjustmentInput {
  adjustmentDate?: Date;
  adjustedBy?: string;
  quantity: number;
  isInflow?: boolean;
  adjustmentReason?: string;
}

interface StockAdjustmentDocument {
  stockItemId: string;
  quantity: number;
  isInflow?: boolean;
}

/** Creates the adjustment and applies it to the item's stock level. */
export async function createStockAdjustment(
  physicalStoreId: string,
  stockItemId: string,
  input: StockAdjustmentInput,
  userId: string
): Promise<string> {
  return runInTransaction(async () => {
    const date = new Date();
    const stockAdjustmentId = await StockAdjustments.insertAsync({
      physicalStoreId,
      stockItemId,
      ...input,
      createdAt: date,
      createdBy: userId,
      updatedAt: date,
      updatedBy: userId,
    });
    await applyStockMovements([
      { stockItemId, quantity: input.quantity, isInflow: input.isInflow },
    ]);
    return stockAdjustmentId;
  });
}

/** Replaces an unapproved adjustment, moving the stock level to match. */
export async function updateStockAdjustment(
  stockAdjustmentId: string,
  input: StockAdjustmentInput,
  userId: string
): Promise<void> {
  return runInTransaction(async () => {
    const existing = (await StockAdjustments.findOneAsync(
      stockAdjustmentId
    )) as unknown as StockAdjustmentDocument | undefined;
    if (!existing) {
      throw new Error('Stock adjustment not found.');
    }

    await revertStockMovements([existing]);
    await applyStockMovements([
      {
        stockItemId: existing.stockItemId,
        quantity: input.quantity,
        isInflow: input.isInflow,
      },
    ]);

    const updated = await StockAdjustments.updateAsync(
      {
        _id: { $eq: stockAdjustmentId },
        approvedOn: { $eq: null },
        approvedBy: { $eq: null },
      },
      { $set: { ...input, updatedAt: new Date(), updatedBy: userId } }
    );
    if (!updated) {
      throw new Error('You cannot update an already approved Stock Adjustment.');
    }
  });
}

/**
 * Removes adjustments of a store. The stock changes of the unapproved ones
 * are undone first. Returns how many adjustments were removed.
 */
export async function removeStockAdjustments(
  physicalStoreId: string,
  stockAdjustmentIds: string[]
): Promise<number> {
  return runInTransaction(async () => {
    const unapproved = (await StockAdjustments.find({
      _id: { $in: stockAdjustmentIds },
      physicalStoreId,
      approvedOn: { $exists: false },
      approvedBy: { $exists: false },
    }).fetchAsync()) as unknown as StockAdjustmentDocument[];
    await revertStockMovements(unapproved);
    return StockAdjustments.removeAsync({
      _id: { $in: stockAdjustmentIds },
      physicalStoreId,
    });
  });
}
