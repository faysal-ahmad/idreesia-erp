import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { Payments as PaymentSchema } from 'meteor/idreesia-common/server/schemas/accounts';

class Payments extends AggregatableCollection {
  constructor(name = 'accounts-payments', options = {}) {
    const vouchers = super(name, options);
    vouchers.attachSchema(PaymentSchema);
    return vouchers;
  }
}

export default new Payments();
