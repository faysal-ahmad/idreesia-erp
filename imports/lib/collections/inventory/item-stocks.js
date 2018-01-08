import { Mongo } from 'meteor/mongo';

import { ItemStock as ItemStockSchema } from '../../schemas/inventory';

class ItemStocks extends Mongo.Collection {
  constructor(name, options = {}) {
    const itemStocks = super('inventory-item-stocks', options);
    itemStocks.attachSchema(ItemStockSchema);
    return itemStocks;
  }
}

export default new ItemStocks();
