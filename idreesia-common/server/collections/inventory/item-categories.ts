import { Mongo } from 'meteor/mongo';

import { ItemCategory as ItemCategorySchema } from 'meteor/idreesia-common/server/schemas/inventory';

class ItemCategories extends Mongo.Collection {
  constructor(name = 'inventory-item-categories', options = {}) {
    super(name, options);
    this.attachSchema(ItemCategorySchema);
  }
}

export default new ItemCategories();
