import { Accounts } from 'meteor/accounts-base';
import { Migrations } from 'meteor/percolate:migrations';

Migrations.add({
  version: 12,
  up() {
    const guestUser = Accounts.findUserByUsername('erp-guest');
    if (!guestUser) {
      Accounts.createUser({
        username: 'erp-guest',
        password: 'p@ssw0rd',
      });
    }
  },
});
