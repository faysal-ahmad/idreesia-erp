Package.describe({
  name: "idreesia-common",
  version: "0.0.1",
  summary: "Contains common code used by both the ERP and Jobs app"
});

Package.onUse(function(api) {
  api.versionsFrom("1.8.0.1");
  api.use("ecmascript");
});
