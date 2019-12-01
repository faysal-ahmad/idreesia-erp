import { Accounts } from 'meteor/accounts-base';

let googleService;

if (process.env.NODE_ENV === 'production') {
  googleService = {
    clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
    secret: process.env.GOOGLE_OAUTH_SECRET,
  };
} else {
  googleService = Meteor.settings.private.oAuth.google;
}

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
