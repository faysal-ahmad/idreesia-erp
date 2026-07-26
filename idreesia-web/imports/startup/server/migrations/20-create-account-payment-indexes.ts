import { Migrations } from 'meteor/percolate:migrations';

import {
  Payments,
  PaymentsHistory,
} from 'meteor/idreesia-common/server/collections/accounts';

Migrations.add({
  version: 20,
  async up() {
    const payments = Payments.rawCollection();
    await payments.createIndex({ name: 'text' });
    await payments.createIndex({ cnicNumber: 1 }, { background: true });
    await payments.createIndex({ paymentNumber: 1 }, { background: true });
    await payments.createIndex({ paymentType: 1 }, { background: true });
    await payments.createIndex({ paymentDate: 1 }, { background: true });
    await payments.createIndex({ isDeleted: 1 }, { background: true });

    const paymentsHistory = PaymentsHistory.rawCollection();
    await paymentsHistory.createIndex({ paymentId: 1 }, { background: true });
  },
});
