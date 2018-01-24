import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';

import { Profiles } from '/imports/lib/collections/admin';

export default new ValidatedMethod({
  name: 'admin/profiles.create',
  validate: null,
  run({ doc }) {
    const { cnicNumber } = doc;

    if (Profiles.findOne({ cnicNumber })) {
      throw new Meteor.Error('not-allowed', 'A user with that CNIC number already exists', {
        cnicNumber
      });
    }

    const time = Date.now();
    doc.createdAt = time;
    doc.updatedAt = time;
    return Profiles.insert(doc);
  }
});
