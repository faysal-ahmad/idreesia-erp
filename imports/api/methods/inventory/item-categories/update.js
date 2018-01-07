import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';

import { ItemCategories } from '/imports/lib/collections/inventory';

export default new ValidatedMethod({
  name: 'inventory/itemCategories.update',
  validate: null,
  run({ doc }) {
    const { _id, name } = doc;

    const existingCategory = ItemCategories.findOne({
      _id: { $ne: _id },
      name: { $eq: name }
    });

    if (existingCategory) {
      throw new Meteor.Error('not-allowed', 'A category with that name already exists', { name });
    }

    delete doc._id;
    doc.updatedAt = Date.now();
    return ItemCategories.update(_id, { $set: doc });
  }
});
