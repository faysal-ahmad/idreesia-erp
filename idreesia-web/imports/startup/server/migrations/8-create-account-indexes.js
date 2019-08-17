import { Migrations } from "meteor/percolate:migrations";

import { AccountMonthlyBalances } from "meteor/idreesia-common/collections/accounts";

Migrations.add({
  version: 8,
  up() {
    const accountMonthlyCalculations = AccountMonthlyBalances.rawCollection();
    accountMonthlyCalculations.createIndex(
      { companyId: 1 },
      { background: true }
    );
    accountMonthlyCalculations.createIndex(
      { accountHeadId: 1 },
      { background: true }
    );
    accountMonthlyCalculations.createIndex(
      { monthString: 1 },
      { background: true }
    );
  },
});
