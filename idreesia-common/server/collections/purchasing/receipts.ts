import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { PurchasingReceipt as Schema } from 'meteor/idreesia-common/server/schemas/purchasing';

import type { PurchasingReceiptDocument } from './types';

class PurchasingReceipts extends AggregatableCollection<PurchasingReceiptDocument> {
  constructor(name = 'purchasing-receipts', options = {}) {
    super(name, options);
    this.attachSchema(Schema);
  }
}

export default new PurchasingReceipts();
