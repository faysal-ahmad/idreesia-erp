import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { AccountHead as AccountHeadSchema } from 'meteor/idreesia-common/server/schemas/accounts';

class AccountHeads extends AggregatableCollection {
  constructor(name = 'accounts-account-heads', options = {}) {
    super(name, options);
    this.attachSchema(AccountHeadSchema);
  }
}

export default new AccountHeads();
