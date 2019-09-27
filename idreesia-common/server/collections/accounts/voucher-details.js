import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { VoucherDetail as VoucherDetailSchema } from 'meteor/idreesia-common/server/schemas/accounts';

class VoucherDetails extends AggregatableCollection {
  constructor(name = 'accounts-voucher-details', options = {}) {
    const voucherDetails = super(name, options);
    voucherDetails.attachSchema(VoucherDetailSchema);
    return voucherDetails;
  }
}

export default new VoucherDetails();
