import { assign } from "lodash";

import { AggregatableCollection } from "meteor/idreesia-common/collections";
import { StockItem as StockItemSchema } from "../../schemas/inventory";
import { StockItem as StockItemModel } from "meteor/idreesia-common/models/inventory";

class StockItems extends AggregatableCollection {
  constructor(name = "inventory-stock-items", options = {}) {
    const stockItems = super(
      name,
      assign({}, options, {
        transform(doc) {
          return new StockItemModel(doc);
        }
      })
    );
    stockItems.attachSchema(StockItemSchema);
    return stockItems;
  }

  incrementCurrentLevel(stockItemId, incrementBy) {
    const stockItem = this.findOne(stockItemId);
    this.update(stockItemId, {
      $set: {
        currentStockLevel: stockItem.currentStockLevel + incrementBy
      }
    });
  }

  decrementCurrentLevel(stockItemId, decrementBy) {
    const stockItem = this.findOne(stockItemId);
    this.update(stockItemId, {
      $set: {
        currentStockLevel: stockItem.currentStockLevel - decrementBy
      }
    });
  }
}

export default new StockItems();
