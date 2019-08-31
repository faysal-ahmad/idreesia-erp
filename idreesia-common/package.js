Package.describe({
  name: 'idreesia-common',
  version: '1.0.0',
  summary: 'Contains common code used by both the ERP and Jobs app',
});

Package.onUse(api => {
  api.versionsFrom('1.8.0.1');
  api.use('ecmascript');
  api.use('aldeed:collection2-core');
  api.use('swydo:graphql@0.4.0');
  api.use('accounts-password@1.5.1');
});
