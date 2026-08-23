import { Accounts } from 'meteor/accounts-base';
import { Migrations } from 'meteor/quave:migrations';

Migrations.add({
  version: 12,
  async up() {
    const guestUser = await Accounts.findUserByUsername('erp-guest');
    if (!guestUser) {
      await Accounts.createUserAsync({
        username: 'erp-guest',
        password: 'p@ssw0rd',
      });
    }
  },
});
