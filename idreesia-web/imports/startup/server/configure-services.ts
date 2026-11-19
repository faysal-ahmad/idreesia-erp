import { Accounts } from 'meteor/accounts-base';

// Turn off accounts-password's `createUser` DDP method, which would otherwise
// let anyone create an unlocked account with a password and bypass the lock
// that registerUser applies. Every account is created on the server
// (registerUser, the admin createUser mutation, migrations) through
// Accounts.createUserAsync, which this setting does not affect.
//
// Login tokens (Meteor sessions and REST /login tokens) last 30 days instead
// of Meteor's default 90, so a leaked or forgotten session ends sooner.
Accounts.config({
  forbidClientAccountCreation: true,
  loginExpirationInDays: 30,
});

// Update default values for the email workflows
Accounts.emailTemplates.from = 'erp-admin@idreesia.com';
Accounts.urls.resetPassword = function reset(token) {
  return Meteor.absoluteUrl(`reset-forgotten-password/${token}`);
};
Accounts.urls.enrollAccount = function enroll(token) {
  return Meteor.absoluteUrl(`set-initial-password/${token}`);
};
