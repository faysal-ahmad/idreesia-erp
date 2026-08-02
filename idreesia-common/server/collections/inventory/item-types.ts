import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { ItemType as ItemTypeSchema } from 'meteor/idreesia-common/server/schemas/inventory';

class ItemTypes extends AggregatableCollection {
  constructor(name = 'inventory-item-types', options = {}) {
    super(name, options);
    this.attachSchema(ItemTypeSchema);
  }
}

export default new ItemTypes();
