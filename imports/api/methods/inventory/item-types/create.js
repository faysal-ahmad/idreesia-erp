import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';

import { ItemTypes } from '/imports/lib/collections/inventory';

export default new ValidatedMethod({
  name: 'inventory/itemTypes.create',
  validate: null,
  run({ doc }) {
    const { name } = doc;

    if (ItemTypes.findOne({ name })) {
      throw new Meteor.Error('not-allowed', 'An item type with that name already exists', { name });
    }

    const time = Date.now();
    doc.createdAt = time;
    doc.updatedAt = time;
    return ItemTypes.insert(doc);
  }
});
