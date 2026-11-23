import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { PurchasingVendor as Schema } from 'meteor/idreesia-common/server/schemas/purchasing';

import type { PurchasingVendorDocument } from './types';

class PurchasingVendors extends AggregatableCollection<PurchasingVendorDocument> {
  constructor(name = 'purchasing-vendors', options = {}) {
    super(name, options);
    this.attachSchema(Schema);
  }
}

export default new PurchasingVendors();
