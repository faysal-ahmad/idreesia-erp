// import moment from "moment";
import { Migrations } from "meteor/percolate:migrations";

import { AccountMonthlyBalances } from "meteor/idreesia-common/collections/accounts";
// import calculateAllAccountBalancesFromMonth from "meteor/idreesia-common/business-logic/accounts/calculate-all-account-balances-from-month";
// import calculateAccountBalancesForMonth from "meteor/idreesia-common/business-logic/accounts/calculate-account-balances-for-month";

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

    /*
    [511000001] Basic Salaries-Admn
    const companies = Companies.find({}).fetch();
    const promises = companies.map(company =>
      );
      return Promise.all(promises);

    return calculateAccountBalancesForMonth(
      "qiwB6bLfDveJaZr5Z",
      "511000001",
      moment("01-01-2019", "DD-MM-YYYY")
    );

    return calculateAllAccountBalancesFromMonth(
      "qiwB6bLfDveJaZr5Z",
      moment("01-07-2017", "DD-MM-YYYY")
    );
      */
  },
});
