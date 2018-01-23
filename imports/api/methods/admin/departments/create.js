import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';

import { Departments } from '/imports/lib/collections/admin';

export default new ValidatedMethod({
  name: 'admin/departments.create',
  validate: null,
  run({ doc }) {
    const { name } = doc;

    if (Departments.findOne({ name })) {
      throw new Meteor.Error('not-allowed', 'A department with that name already exists', { name });
    }

    const time = Date.now();
    doc.createdAt = time;
    doc.updatedAt = time;
    return Departments.insert(doc);
  }
});
