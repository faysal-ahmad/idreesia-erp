import { Migrations } from 'meteor/quave:migrations';

import {
  LoginAttempts,
  Users,
} from 'meteor/idreesia-common/server/collections/admin';

Migrations.add({
  version: 68,
  async up() {
    const loginAttempts = LoginAttempts.rawCollection();
    // An account's attempts across addresses, for its cap and status.
    await loginAttempts.createIndex(
      { userId: 1, lastAttemptAt: 1 },
      { background: true }
    );
    // Drops each document once its count is forgotten or its trust ends.
    await loginAttempts.createIndex(
      { expiresAt: 1 },
      { background: true, expireAfterSeconds: 0 }
    );

    // Password logins used to be counted per account on the user document.
    // They are now counted per account and address in login-attempts.
    await Users.updateAsync(
      { loginAttempts: { $exists: true } },
      { $unset: { loginAttempts: '' } },
      { multi: true }
    );
  },
});
