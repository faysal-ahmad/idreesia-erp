import { StockItems } from 'meteor/idreesia-common/server/collections/inventory';

/** A stock item's quantity moving into (inflow) or out of the store. */
export interface StockMovement {
  stockItemId: string;
  quantity: number;
  isInflow?: boolean;
}

// $inc, so concurrent changes to the same item (or one form listing an item
// twice) all count.
export async function incrementStockLevel(
  stockItemId: string,
  incrementBy: number
) {
  return StockItems.updateAsync(stockItemId, {
    $inc: { currentStockLevel: incrementBy },
  });
}

export async function decrementStockLevel(
  stockItemId: string,
  decrementBy: number
) {
  return incrementStockLevel(stockItemId, -decrementBy);
}

/** Applies the stock levels changes of a form's movements. */
export async function applyStockMovements(movements: StockMovement[]) {
  for (const { stockItemId, quantity, isInflow } of movements) {
    await incrementStockLevel(stockItemId, isInflow ? quantity : -quantity);
  }
}

/** Undoes the stock levels changes of a form's movements. */
export async function revertStockMovements(movements: StockMovement[]) {
  for (const { stockItemId, quantity, isInflow } of movements) {
    await incrementStockLevel(stockItemId, isInflow ? -quantity : quantity);
  }
}
