import { Accounts } from 'meteor/accounts-base';
import { Migrations } from 'meteor/quave:migrations';

// Deliberately created without a password, unlike erp-admin/erp-guest -
// this account is never meant to log in, only to be referenced by _id
// when a scheduled job needs a `user` for record-stamping.
Migrations.add({
  version: 47,
  async up() {
    const systemUser = await Accounts.findUserByUsername('erp-system');
    if (!systemUser) {
      await Accounts.createUserAsync({
        username: 'erp-system',
        profile: { name: 'ERP System' },
      });
    }
  },
});
