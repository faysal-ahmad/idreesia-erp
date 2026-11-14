import { StockItems } from 'meteor/idreesia-common/server/collections/inventory';

export async function incrementStockLevel(
  stockItemId: string,
  incrementBy: number
) {
  const stockItem = await StockItems.findOneAsync(stockItemId);
  return StockItems.updateAsync(stockItemId, {
    $set: {
      currentStockLevel: (stockItem?.currentStockLevel ?? 0) + incrementBy,
    },
  });
}

export async function decrementStockLevel(
  stockItemId: string,
  decrementBy: number
) {
  const stockItem = await StockItems.findOneAsync(stockItemId);
  return StockItems.updateAsync(stockItemId, {
    $set: {
      currentStockLevel: (stockItem?.currentStockLevel ?? 0) - decrementBy,
    },
  });
}
