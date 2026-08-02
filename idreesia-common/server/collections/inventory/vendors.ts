import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { Vendor as VendorSchema } from 'meteor/idreesia-common/server/schemas/inventory';

class Vendors extends AggregatableCollection {
  constructor(name = 'inventory-vendors', options = {}) {
    super(name, options);
    this.attachSchema(VendorSchema);
  }
}

export default new Vendors();
