import { Accounts } from 'meteor/accounts-base';
import { Profiles } from '/imports/lib/collections/admin';

const adminUser = Accounts.findUserByUsername('erp-admin');
if (!adminUser) {
  const userId = Accounts.createUser({
    username: 'erp-admin',
    password: 'p@ssw0rd'
  });

  const time = Date.now();
  Profiles.insert({
    userId,
    firstName: 'ERP',
    lastName: 'Administrator',
    cnicNumber: '00000-0000000-0',
    createdAt: time,
    updatedAt: time
  });
}
