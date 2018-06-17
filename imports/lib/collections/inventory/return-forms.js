import { AggregatableCollection } from '/imports/lib/collections';

import { ReturnForm as ReturnFormSchema } from '../../schemas/inventory';

class ReturnForms extends AggregatableCollection {
  constructor(name = 'inventory-return-forms', options = {}) {
    const returnForms = super(name, options);
    returnForms.attachSchema(ReturnFormSchema);
    return returnForms;
  }
}

export default new ReturnForms();
