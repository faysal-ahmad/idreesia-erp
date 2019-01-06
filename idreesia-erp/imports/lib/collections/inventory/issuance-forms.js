import { AggregatableCollection } from '/imports/lib/collections';

import { IssuanceForm as IssuanceFormSchema } from '../../schemas/inventory';

class IssuanceForms extends AggregatableCollection {
  constructor(name = 'inventory-issuance-forms', options = {}) {
    const issuanceForms = super(name, options);
    issuanceForms.attachSchema(IssuanceFormSchema);
    return issuanceForms;
  }
}

export default new IssuanceForms();
