import { AggregatableCollection } from 'meteor/idreesia-common/collections';

import { ItemType as ItemTypeSchema } from '../../schemas/inventory';

class ItemTypes extends AggregatableCollection {
  constructor(name = 'inventory-item-types', options = {}) {
    const itemTypes = super(name, options);
    itemTypes.attachSchema(ItemTypeSchema);
    return itemTypes;
  }
}

export default new ItemTypes();
