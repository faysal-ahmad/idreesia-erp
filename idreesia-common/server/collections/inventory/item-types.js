import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { ItemType as ItemTypeSchema } from 'meteor/idreesia-common/server/schemas/inventory';

class ItemTypes extends AggregatableCollection {
  constructor(name = 'inventory-item-types', options = {}) {
    const itemTypes = super(name, options);
    itemTypes.attachSchema(ItemTypeSchema);
    return itemTypes;
  }
}

export default new ItemTypes();
