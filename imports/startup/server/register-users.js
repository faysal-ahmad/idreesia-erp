import { Accounts } from 'meteor/accounts-base';

const adminUser = Accounts.findUserByUsername('erp-admin');
if (!adminUser) {
  Accounts.createUser({
    username: 'erp-admin',
    password: 'p@ssw0rd'
  });
}
