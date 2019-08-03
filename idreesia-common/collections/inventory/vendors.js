import { AggregatableCollection } from "meteor/idreesia-common/collections";

import { Vendor as VendorSchema } from "../../schemas/inventory";

class Vendors extends AggregatableCollection {
  constructor(name = "inventory-vendors", options = {}) {
    const vendors = super(name, options);
    vendors.attachSchema(VendorSchema);
    return vendors;
  }
}

export default new Vendors();
