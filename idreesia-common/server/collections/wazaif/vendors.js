import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { Vendor as VendorSchema } from 'meteor/idreesia-common/server/schemas/wazaif';

class Vendors extends AggregatableCollection {
  constructor(name = 'wazaif-management-vendors', options = {}) {
    const vendors = super(name, options);
    vendors.attachSchema(VendorSchema);
    return vendors;
  }
}

export default new Vendors();
