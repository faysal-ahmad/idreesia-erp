import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { VoucherDetail as VoucherDetailSchema } from 'meteor/idreesia-common/server/schemas/accounts';

class VoucherDetails extends AggregatableCollection {
  constructor(name = 'accounts-voucher-details', options = {}) {
    super(name, options);
    this.attachSchema(VoucherDetailSchema);
  }
}

export default new VoucherDetails();
