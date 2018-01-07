import { Mongo } from 'meteor/mongo';

import { ItemType as ItemTypeSchema } from '../../schemas/inventory';

class ItemTypes extends Mongo.Collection {
  constructor(name, options = {}) {
    const itemTypes = super('inventory-item-types', options);
    itemTypes.attachSchema(ItemTypeSchema);
    return itemTypes;
  }
}

export default new ItemTypes();
