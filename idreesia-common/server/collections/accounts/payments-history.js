import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { PaymentsHistory as PaymentsHistorySchema } from 'meteor/idreesia-common/server/schemas/accounts';

class PaymentsHistory extends AggregatableCollection {
  constructor(name = 'accounts-payments-history', options = {}) {
    const vouchers = super(name, options);
    vouchers.attachSchema(PaymentsHistorySchema);
    return vouchers;
  }

  getNextVersionForPaymentHistory(paymentId) {
    const history = this.findOne(
      {
        paymentId,
      },
      {
        sort: {
          createdAt: -1,
        },
      }
    );

    return history ? history.version + 1 : 1;
  }
}

export default new PaymentsHistory();
