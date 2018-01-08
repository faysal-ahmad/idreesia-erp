import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';

import { ItemCategories } from '/imports/lib/collections/inventory';

export default new ValidatedMethod({
  name: 'inventory/itemCategories.create',
  validate: null,
  run({ doc }) {
    const { name } = doc;

    if (ItemCategories.findOne({ name })) {
      throw new Meteor.Error('not-allowed', 'A category with that name already exists', { name });
    }

    const time = Date.now();
    doc.createdAt = time;
    doc.updatedAt = time;
    return ItemCategories.insert(doc);
  }
});