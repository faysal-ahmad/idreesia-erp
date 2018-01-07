import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';

import { PhysicalStores } from '/imports/lib/collections/inventory';

export default new ValidatedMethod({
  name: 'inventory/physicalStores.create',
  validate: null,
  run({ doc }) {
    const { communityId } = this;
    const { name } = doc;

    if (PhysicalStores.findOne({ name })) {
      throw new Meteor.Error('not-allowed', 'A store with that name already exists', { name });
    }

    const time = Date.now();
    doc.createdAt = time;
    doc.updatedAt = time;
    return PhysicalStores.insert(doc);
  }
});
