import { Accounts } from 'meteor/accounts-base';

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
Accounts.updateOrCreateUserFromExternalService = function(
  serviceName,
  serviceData,
  options
) {
  if (serviceName === 'google') {
    const { email } = serviceData;
    const updatedDocs = Meteor.users.update(
      { 'services.google.email': email },
      {
        $set: {
          'services.google': serviceData,
        },
      }
    );

    if (updatedDocs === 0) return null;
  }

  return updateOrCreateUserFromExternalServiceOriginal.apply(this, [
    serviceName,
    serviceData,
    options,
  ]);
};
