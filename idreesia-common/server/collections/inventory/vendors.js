import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { Vendor as VendorSchema } from 'meteor/idreesia-common/server/schemas/inventory';

class Vendors extends AggregatableCollection {
  constructor(name = 'inventory-vendors', options = {}) {
    const vendors = super(name, options);
    vendors.attachSchema(VendorSchema);
    return vendors;
  }
}

export default new Vendors();
