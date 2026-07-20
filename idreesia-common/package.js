Package.describe({
  name: 'idreesia-common',
  version: '1.0.0',
  summary: 'Contains common code used by both the Web, Mobile and Jobs app',
});

Package.onUse(api => {
  api.addFiles('private/auth/google.json', 'server', { isAsset: true });

  api.versionsFrom('3.5');
  api.use('ecmascript');
  api.use('accounts-password');
  api.use('aldeed:collection2', 'server');
});
