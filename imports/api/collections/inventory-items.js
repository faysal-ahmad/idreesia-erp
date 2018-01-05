import { Mongo } from 'meteor/mongo';

import { InventoryItems as InventoryItemsSchema } from '../schemas';

class InventoryItems extends Mongo.Collection {
  constructor(name, options = {}) {
    const inventoryItems = super('inventory-items', options);
    inventoryItems.attachSchema(InventoryItemsSchema);
    return inventoryItems;
  }
}

export default new InventoryItems();
