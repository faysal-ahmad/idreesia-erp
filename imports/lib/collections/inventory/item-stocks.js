import { Mongo } from 'meteor/mongo';

import { ItemStock as ItemStockSchema } from '../../schemas/inventory';

class ItemStocks extends Mongo.Collection {
  constructor(name = 'inventory-item-stocks', options = {}) {
    const itemStocks = super(name, options);
    itemStocks.attachSchema(ItemStockSchema);
    return itemStocks;
  }
}

export default new ItemStocks();
