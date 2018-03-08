import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';

import { IssuanceForms } from '/imports/lib/collections/inventory';

export default new ValidatedMethod({
  name: 'inventory/issuanceForms.create',
  validate: null,
  run({ doc }) {
    const time = Date.now();
    doc.createdAt = time;
    doc.updatedAt = time;
    return IssuanceForms.insert(doc);
  }
});
