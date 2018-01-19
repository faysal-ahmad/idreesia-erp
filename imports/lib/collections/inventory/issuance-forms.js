import { Mongo } from 'meteor/mongo';

import { IssuanceForm as IssuanceFormSchema } from '../../schemas/inventory';

class IssuanceForms extends Mongo.Collection {
  constructor(name = 'inventory-issuance-forms', options = {}) {
    const issuanceForms = super(name, options);
    issuanceForms.attachSchema(IssuanceFormSchema);
    return issuanceForms;
  }
}

export default new IssuanceForms();
