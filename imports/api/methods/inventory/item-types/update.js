import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';

import { ItemTypes } from '/imports/lib/collections/inventory';

export default new ValidatedMethod({
  name: 'inventory/itemTypes.update',
  validate: null,
  run({ doc }) {
    const { _id, name } = doc;

    const existingType = ItemTypes.findOne({
      _id: { $ne: _id },
      name: { $eq: name }
    });

    if (existingType) {
      throw new Meteor.Error('not-allowed', 'An item type with that name already exists', { name });
    }

    delete doc._id;
    doc.updatedAt = Date.now();
    return ItemTypes.update(_id, { $set: doc });
  }
});
