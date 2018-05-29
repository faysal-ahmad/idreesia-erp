import { AggregatableCollection } from '/imports/lib/collections';

import { StockItem as StockItemSchema } from '../../schemas/inventory';

class StockItems extends AggregatableCollection {
  constructor(name = 'inventory-stock-items', options = {}) {
    const stockItems = super(name, options);
    stockItems.attachSchema(StockItemSchema);
    return stockItems;
  }
}

export default new StockItems();
