import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';

import { IssuanceForms } from '/imports/lib/collections/inventory';

export default new ValidatedMethod({
  name: 'inventory/issuanceForms.find',
  validate: null,
  run({ pageNumber, itemsCount, filterCriteria }) {
    return IssuanceForms.find({}).fetch();
  }
});
