import { Mongo } from "meteor/mongo";

import { AccountMonthlyBalance as AccountMonthlyBalanceSchema } from "../../schemas/accounts";

class AccountMonthlyBalances extends Mongo.Collection {
  constructor(name = "accounts-account-monthly-balances", options = {}) {
    const accountMonthlyBalances = super(name, options);
    accountMonthlyBalances.attachSchema(AccountMonthlyBalanceSchema);
    return accountMonthlyBalances;
  }
}

export default new AccountMonthlyBalances();
