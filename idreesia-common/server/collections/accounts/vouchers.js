import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { Voucher as VoucherSchema } from 'meteor/idreesia-common/server/schemas/accounts';

class Vouchers extends AggregatableCollection {
  constructor(name = 'accounts-vouchers', options = {}) {
    const vouchers = super(name, options);
    vouchers.attachSchema(VoucherSchema);
    return vouchers;
  }
}

export default new Vouchers();
