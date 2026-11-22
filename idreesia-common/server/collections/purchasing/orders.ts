import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { PurchasingOrder as Schema } from 'meteor/idreesia-common/server/schemas/purchasing';

import type { PurchasingOrderDocument } from './types';

class PurchasingOrders extends AggregatableCollection<PurchasingOrderDocument> {
  constructor(name = 'purchasing-orders', options = {}) {
    super(name, options);
    this.attachSchema(Schema);
  }
}

export default new PurchasingOrders();
