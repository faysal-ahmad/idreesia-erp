import { AggregatableCollection } from "meteor/idreesia-common/collections";
import { AccountHead as AccountHeadSchema } from "../../schemas/accounts";

class AccountHeads extends AggregatableCollection {
  constructor(name = "accounts-account-heads", options = {}) {
    const accountHeads = super(name, options);
    accountHeads.attachSchema(AccountHeadSchema);
    return accountHeads;
  }
}

export default new AccountHeads();
