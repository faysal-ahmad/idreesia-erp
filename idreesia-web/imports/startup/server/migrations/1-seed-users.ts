import { Accounts } from 'meteor/accounts-base';
import { Migrations } from 'meteor/quave:migrations';

import { Users } from 'meteor/idreesia-common/server/collections/admin';

// The built-in accounts:
//  - erp-admin is a super admin, so it can grant super-admin rights (the
//    isSuperAdmin flag) to other users.
//  - erp-guest is the shared guest login.
//  - erp-system has no password on purpose. It never logs in; scheduled jobs
//    use its _id when they need a `user` to stamp records with.
Migrations.add({
  version: 1,
  name: 'Seed the built-in users',
  async up() {
    if (!(await Accounts.findUserByUsername('erp-admin'))) {
      await Accounts.createUserAsync({
        username: 'erp-admin',
        password: 'p@ssw0rd',
      });
    }
    await Users.updateAsync(
      { username: 'erp-admin' },
      { $set: { isSuperAdmin: true } }
    );

    if (!(await Accounts.findUserByUsername('erp-guest'))) {
      await Accounts.createUserAsync({
        username: 'erp-guest',
        password: 'p@ssw0rd',
      });
    }

    if (!(await Accounts.findUserByUsername('erp-system'))) {
      await Accounts.createUserAsync({
        username: 'erp-system',
        profile: { name: 'ERP System' },
      });
    }
  },
});
