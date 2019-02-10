import { Mongo } from 'meteor/mongo';

import { Category as CategorySchema } from '../../schemas/accounts';

class Categories extends Mongo.Collection {
  constructor(name = 'accounts-categories', options = {}) {
    const categories = super(name, options);
    categories.attachSchema(CategorySchema);
    return categories;
  }
}

export default new Categories();
