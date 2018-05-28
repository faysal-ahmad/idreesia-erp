import { Mongo } from 'meteor/mongo';

import { StockItem as StockItemSchema } from '../../schemas/inventory';

class StockItems extends Mongo.Collection {
  constructor(name = 'inventory-stock-items', options = {}) {
    const stockItems = super(name, options);
    stockItems.attachSchema(StockItemSchema);
    return stockItems;
  }
}

export default new StockItems();
