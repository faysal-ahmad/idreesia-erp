import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';

import { Profiles } from '/imports/lib/collections/admin';

export default new ValidatedMethod({
  name: 'admin/profiles.update',
  validate: null,
  run({ doc }) {
    const { _id, cnicNumber } = doc;

    const existingProfile = Profiles.findOne({
      _id: { $ne: _id },
      cnicNumber: { $eq: cnicNumber }
    });

    if (existingProfile) {
      throw new Meteor.Error('not-allowed', 'A user with that CNIC number already exists', {
        cnicNumber
      });
    }

    delete doc._id;
    doc.updatedAt = Date.now();
    return Profiles.update(_id, { $set: doc });
  }
});
