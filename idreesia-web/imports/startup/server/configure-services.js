import { Accounts } from 'meteor/accounts-base';

// Update default values for the email workflows
Accounts.emailTemplates.from = 'erp-admin@idreesia.com';
Accounts.urls.resetPassword = function reset(token) {
  return Meteor.absoluteUrl(`reset-forgotten-password/${token}`);
};
Accounts.urls.enrollAccount = function enroll(token) {
  return Meteor.absoluteUrl(`set-initial-password/${token}`);
};

const googleService = Meteor.settings.private.oAuth.google;

ServiceConfiguration.configurations.upsert(
  { service: 'google' },
  {
    $set: googleService,
  }
);

const updateOrCreateUserFromExternalServiceOriginal =
  Accounts.updateOrCreateUserFromExternalService;

// eslint-disable-next-line func-names
Accounts.updateOrCreateUserFromExternalService = function (
  serviceName,
  serviceData,
  options
) {
  if (serviceName === 'google') {
    const { email } = serviceData;
    const updatedDocs = Meteor.users.update(
      { 'emails.0.address': email },
      {
        $set: {
          'services.google': serviceData,
        },
      }
    );

    if (updatedDocs === 0) return undefined;
  }

  return updateOrCreateUserFromExternalServiceOriginal.apply(this, [
    serviceName,
    serviceData,
    options,
  ]);
};
