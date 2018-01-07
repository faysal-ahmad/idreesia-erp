import { Mongo } from 'meteor/mongo';

import { ItemCategory as ItemCategorySchema } from '../../schemas/inventory';

class ItemCategories extends Mongo.Collection {
  constructor(name, options = {}) {
    const itemCategories = super('inventory-item-categories', options);
    itemCategories.attachSchema(ItemCategorySchema);
    return itemCategories;
  }
}

export default new ItemCategories();
