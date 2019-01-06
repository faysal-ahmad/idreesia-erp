import { Mongo } from 'meteor/mongo';

import { FinancialAccount as FinancialAccountSchema } from '../../schemas/accounts';

class FinancialAccounts extends Mongo.Collection {
  constructor(name = 'accounts-financial-accounts', options = {}) {
    const financialAccounts = super(name, options);
    financialAccounts.attachSchema(FinancialAccountSchema);
    return financialAccounts;
  }
}

export default new FinancialAccounts();
