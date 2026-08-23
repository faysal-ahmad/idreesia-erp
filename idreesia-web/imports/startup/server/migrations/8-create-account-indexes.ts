import { Migrations } from 'meteor/quave:migrations';

import { AccountMonthlyBalances } from 'meteor/idreesia-common/server/collections/accounts';

Migrations.add({
  version: 8,
  async up() {
    const accountMonthlyCalculations = AccountMonthlyBalances.rawCollection();
    await accountMonthlyCalculations.createIndex(
      { companyId: 1 },
      { background: true }
    );
    await accountMonthlyCalculations.createIndex(
      { accountHeadId: 1 },
      { background: true }
    );
    await accountMonthlyCalculations.createIndex(
      { monthString: 1 },
      { background: true }
    );
  },
});
