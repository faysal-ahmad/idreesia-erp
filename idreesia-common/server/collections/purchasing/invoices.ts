import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { PurchasingInvoice as Schema } from 'meteor/idreesia-common/server/schemas/purchasing';

import type { PurchasingInvoiceDocument } from './types';

class PurchasingInvoices extends AggregatableCollection<PurchasingInvoiceDocument> {
  constructor(name = 'purchasing-invoices', options = {}) {
    super(name, options);
    this.attachSchema(Schema);
  }
}

export default new PurchasingInvoices();
