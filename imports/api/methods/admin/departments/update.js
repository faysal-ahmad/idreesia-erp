import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';

import { Departments } from '/imports/lib/collections/admin';

export default new ValidatedMethod({
  name: 'admin/departments.update',
  validate: null,
  run({ doc }) {
    const { _id, name } = doc;

    const existingDepartment = Departments.findOne({
      _id: { $ne: _id },
      name: { $eq: name }
    });

    if (existingDepartment) {
      throw new Meteor.Error('not-allowed', 'A department with that name already exists', { name });
    }

    delete doc._id;
    doc.updatedAt = Date.now();
    return Departments.update(_id, { $set: doc });
  }
});
