import { Accounts } from 'meteor/accounts-base';

// Update default values for the email workflows
Accounts.emailTemplates.from = 'erp-admin@idreesia.com';
Accounts.urls.resetPassword = function reset(token) {
  return Meteor.absoluteUrl(`reset-forgotten-password/${token}`);
};
Accounts.urls.enrollAccount = function enroll(token) {
  return Meteor.absoluteUrl(`set-initial-password/${token}`);
};
