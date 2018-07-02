import { Mongo } from 'meteor/mongo';

import { Account as AccountSchema } from '../../schemas/finance';

class Accounts extends Mongo.Collection {
  constructor(name = 'finance-accounts', options = {}) {
    const accounts = super(name, options);
    accounts.attachSchema(AccountSchema);
    return accounts;
  }
}

export default new Accounts();
