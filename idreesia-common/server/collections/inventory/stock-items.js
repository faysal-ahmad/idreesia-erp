import { assign } from 'meteor/idreesia-common/utilities/lodash';
import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { StockItem as StockItemSchema } from 'meteor/idreesia-common/server/schemas/inventory';
import { StockItem as StockItemModel } from 'meteor/idreesia-common/server/models/inventory';

class StockItems extends AggregatableCollection {
  constructor(name = 'inventory-stock-items', options = {}) {
    const stockItems = super(
      name,
      assign({}, options, {
        transform(doc) {
          return new StockItemModel(doc);
        },
      })
    );
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
