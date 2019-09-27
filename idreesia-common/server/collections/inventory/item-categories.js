import { Mongo } from 'meteor/mongo';

import { ItemCategory as ItemCategorySchema } from 'meteor/idreesia-common/server/schemas/inventory';

class ItemCategories extends Mongo.Collection {
  constructor(name = 'inventory-item-categories', options = {}) {
    const itemCategories = super(name, options);
    itemCategories.attachSchema(ItemCategorySchema);
    return itemCategories;
  }
}

export default new ItemCategories();
