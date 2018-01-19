import { Mongo } from 'meteor/mongo';

import { ItemType as ItemTypeSchema } from '../../schemas/inventory';

class ItemTypes extends Mongo.Collection {
  constructor(name = 'inventory-item-types', options = {}) {
    const itemTypes = super(name, options);
    itemTypes.attachSchema(ItemTypeSchema);
    return itemTypes;
  }
}

export default new ItemTypes();
