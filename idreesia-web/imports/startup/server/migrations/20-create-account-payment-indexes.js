import { Migrations } from 'meteor/percolate:migrations';

import {
  Payments,
  PaymentsHistory,
} from 'meteor/idreesia-common/server/collections/accounts';

Migrations.add({
  version: 20,
  up() {
    const payments = Payments.rawCollection();
    payments.createIndex({ name: 'text' });
    payments.createIndex({ cnicNumber: 1 }, { background: true });
    payments.createIndex({ paymentNumber: 1 }, { background: true });
    payments.createIndex({ paymentType: 1 }, { background: true });
    payments.createIndex({ paymentDate: 1 }, { background: true });
    payments.createIndex({ isDeleted: 1 }, { background: true });

    const paymentsHistory = PaymentsHistory.rawCollection();
    paymentsHistory.createIndex({ paymentId: 1 }, { background: true });
  },
});
