import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';

import { PhysicalStores } from '/imports/lib/collections/inventory';

export default new ValidatedMethod({
  name: 'inventory/physicalStores.update',
  validate: null,
  run({ doc }) {
    const { _id, name } = doc;

    const existingStore = PhysicalStores.findOne({
      _id: { $ne: _id },
      name: { $eq: name }
    });

    if (existingStore) {
      throw new Meteor.Error('not-allowed', 'A store with that name already exists', { name });
    }

    delete doc._id;
    doc.updatedAt = Date.now();
    return PhysicalStores.update(_id, { $set: doc });
  }
});
