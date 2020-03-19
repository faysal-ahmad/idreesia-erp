import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { Payment as PaymentSchema } from 'meteor/idreesia-common/server/schemas/accounts';
import moment from 'moment';

class Payments extends AggregatableCollection {
  constructor(name = 'accounts-payments', options = {}) {
    const payments = super(name, options);
    payments.attachSchema(PaymentSchema);
    return payments;
  }

  getNextPaymentNo(paymentType, paymentDate) {
    const currentDate = moment(paymentDate);
    let year = moment().year();
    if (currentDate.month() <= 5) {
      year -= 1;
    }
    const startDate = moment(`${year}-07-01 00:00:00`, 'YYYY-MM-DD hh:mm:ss');
    const endDate = moment(`${year + 1}-06-30 23:59:59`, 'YYYY-MM-DD hh:mm:ss');
    const payment = this.findOne(
      {
        paymentType,
        paymentDate: {
          $gte: startDate.toDate(),
          $lte: endDate.toDate(),
        },
      },
      {
        sort: {
          paymentNumber: -1,
        },
      }
    );

    return payment ? payment.paymentNumber + 1 : 1;
  }
}

export default new Payments();
