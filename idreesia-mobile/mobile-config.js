App.info({
  id: 'org.idreesia.erp.mobile',
  name: 'Idreesia Mobile',
  description: 'Mobile client for Idreesia ERP',
  author: 'Idreesia',
  email: 'support@idreesia.org',
  website: 'https://idreesia.org',
  version: '1.0.1',
});

App.setPreference('Orientation', 'portrait');
App.setPreference('DisallowOverscroll', true);
// Keep in sync with palette.background in imports/ui/theme/theme.ts (build-time
// config can't import app code).
App.setPreference('BackgroundColor', '0xfff3f6f4');

// cordova-plugin-camera (visitor photo search). iOS refuses camera access
// without a usage description; Android's CAMERA permission comes from the
// plugin itself.
App.appendToConfig(`
  <edit-config target="NSCameraUsageDescription" file="*-Info.plist" mode="merge">
    <string>Idreesia uses the camera to take a visitor's photo for searching.</string>
  </edit-config>
`);
