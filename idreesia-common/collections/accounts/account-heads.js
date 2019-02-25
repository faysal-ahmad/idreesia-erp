import { Mongo } from "meteor/mongo";

import { AccountHead as AccountHeadSchema } from "../../schemas/accounts";

class AccountHeads extends Mongo.Collection {
  constructor(name = "accounts-account-heads", options = {}) {
    const accountHeads = super(name, options);
    accountHeads.attachSchema(AccountHeadSchema);
    return accountHeads;
  }
}

export default new AccountHeads();
