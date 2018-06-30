import { AggregatableCollection } from '/imports/lib/collections';

import { PurchaseForm as PurchaseFormSchema } from '../../schemas/inventory';

class PurchaseForms extends AggregatableCollection {
  constructor(name = 'inventory-purchase-forms', options = {}) {
    const purchaseForms = super(name, options);
    purchaseForms.attachSchema(PurchaseFormSchema);
    return purchaseForms;
  }
}

export default new PurchaseForms();
