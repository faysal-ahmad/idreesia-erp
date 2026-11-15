import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { IssuanceForm as IssuanceFormSchema } from 'meteor/idreesia-common/server/schemas/inventory';

interface IssuanceFormDocument {
  _id?: string;
  physicalStoreId?: string;
  updatedAt?: Date;
  [key: string]: unknown;
}

class IssuanceForms extends AggregatableCollection<IssuanceFormDocument> {
  constructor(name = 'inventory-issuance-forms', options = {}) {
    super(name, options);
    this.attachSchema(IssuanceFormSchema);
  }
}

export default new IssuanceForms();
