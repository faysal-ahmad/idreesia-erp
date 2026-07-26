// @ts-nocheck
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

ServiceConfiguration.configurations
  .upsertAsync(
    { service: 'google' },
    {
      $set: googleService,
    }
  )
  .catch(error => {
    // eslint-disable-next-line no-console
    console.error('Failed to configure Google OAuth service', error);
  });

const updateOrCreateUserFromExternalServiceOriginal =
  Accounts.updateOrCreateUserFromExternalService;

// eslint-disable-next-line func-names
Accounts.updateOrCreateUserFromExternalService = async function (
  serviceName,
  serviceData,
  options
) {
  if (serviceName === 'google') {
    const { email } = serviceData;
    const updatedDocs = await Meteor.users.updateAsync(
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
