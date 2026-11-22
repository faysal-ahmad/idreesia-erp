import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { PurchasingPayment as Schema } from 'meteor/idreesia-common/server/schemas/purchasing';

import type { PurchasingPaymentDocument } from './types';

class PurchasingPayments extends AggregatableCollection<PurchasingPaymentDocument> {
  constructor(name = 'purchasing-payments', options = {}) {
    super(name, options);
    this.attachSchema(Schema);
  }
}

export default new PurchasingPayments();
