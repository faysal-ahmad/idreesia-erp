import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { Voucher as VoucherSchema } from 'meteor/idreesia-common/server/schemas/accounts';

class Vouchers extends AggregatableCollection {
  constructor(name = 'accounts-vouchers', options = {}) {
    super(name, options);
    this.attachSchema(VoucherSchema);
  }
}

export default new Vouchers();
