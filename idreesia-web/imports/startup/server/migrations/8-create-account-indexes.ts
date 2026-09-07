import { Migrations } from 'meteor/quave:migrations';

// AccountMonthlyBalances collection has since been dropped - see migration 42.
// import { AccountMonthlyBalances } from 'meteor/idreesia-common/server/collections/accounts';

Migrations.add({
  version: 8,
  async up() {
    // AccountMonthlyBalances collection has since been dropped.
    // const accountMonthlyCalculations = AccountMonthlyBalances.rawCollection();
    // await accountMonthlyCalculations.createIndex(
    //   { companyId: 1 },
    //   { background: true }
    // );
    // await accountMonthlyCalculations.createIndex(
    //   { accountHeadId: 1 },
    //   { background: true }
    // );
    // await accountMonthlyCalculations.createIndex(
    //   { monthString: 1 },
    //   { background: true }
    // );
  },
});
