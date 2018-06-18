import { AggregatableCollection } from '/imports/lib/collections';

import { StockItem as StockItemSchema } from '../../schemas/inventory';

class StockItems extends AggregatableCollection {
  constructor(name = 'inventory-stock-items', options = {}) {
    const stockItems = super(name, options);
    stockItems.attachSchema(StockItemSchema);
    return stockItems;
  }

  incrementCurrentLevel(stockItemId, incrementBy) {
    const stockItem = this.findOne(stockItemId);
    this.update(stockItemId, {
      $set: {
        currentStockLevel: stockItem.currentStockLevel + incrementBy,
      },
    });
  }

  decrementCurrentLevel(stockItemId, decrementBy) {
    const stockItem = this.findOne(stockItemId);
    this.update(stockItemId, {
      $set: {
        currentStockLevel: stockItem.currentStockLevel - decrementBy,
      },
    });
  }
}

export default new StockItems();
