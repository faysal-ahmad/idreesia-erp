Package.describe({
  name: 'idreesia-common',
  version: '1.0.0',
  summary: 'Contains common code used by both the ERP and Jobs app',
});

Package.onUse(api => {
  api.addFiles('private/auth/google.json', 'server', { isAsset: true });

  api.versionsFrom('1.8.2');
  api.use('ecmascript');
  api.use('accounts-password@1.5.1');
  api.use('aldeed:collection2-core', 'server');
  api.use('swydo:graphql@0.4.0', 'server');
});
