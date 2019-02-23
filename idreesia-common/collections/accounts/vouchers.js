import { Mongo } from 'meteor/mongo';

import { Voucher as VoucherSchema } from '../../schemas/accounts';

class Vouchers extends Mongo.Collection {
  constructor(name = 'accounts-vouchers', options = {}) {
    const vouchers = super(name, options);
    vouchers.attachSchema(VoucherSchema);
    return vouchers;
  }
}

export default new Vouchers();
