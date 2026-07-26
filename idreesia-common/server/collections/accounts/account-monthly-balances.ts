import { Mongo } from 'meteor/mongo';

import { AccountMonthlyBalance as AccountMonthlyBalanceSchema } from 'meteor/idreesia-common/server/schemas/accounts';

class AccountMonthlyBalances extends Mongo.Collection {
  constructor(name = 'accounts-account-monthly-balances', options = {}) {
    super(name, options);
    this.attachSchema(AccountMonthlyBalanceSchema);
  }
}

export default new AccountMonthlyBalances();
