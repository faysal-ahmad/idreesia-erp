import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { PurchaseForm as PurchaseFormSchema } from 'meteor/idreesia-common/server/schemas/inventory';

interface PurchaseFormDocument {
  _id?: string;
  physicalStoreId?: string;
  updatedAt?: Date;
  [key: string]: unknown;
}

class PurchaseForms extends AggregatableCollection<PurchaseFormDocument> {
  constructor(name = 'inventory-purchase-forms', options = {}) {
    super(name, options);
    this.attachSchema(PurchaseFormSchema);
  }
}

export default new PurchaseForms();
