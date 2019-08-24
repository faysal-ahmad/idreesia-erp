App.info({
    version: '1.0.0',
    buildNumber: 1,
    description: 'Idreesia ERP Client App',
    author: 'Faisal Ahmad',
    email: 'faisal.idreesi@gmail.com',
    website: 'https://idreesia.com',
});

// needs to be lower case because of iOS
App.setPreference('onesignalappid', '');

App.appendToConfig(`
  <edit-config target="NSCameraUsageDescription" file="*-Info.plist" mode="merge">
    <string>We need to access your camera to let you take profile pictures.</string>
  </edit-config>
  <edit-config target="NSPhotoLibraryUsageDescription" file="*-Info.plist" mode="merge">
    <string>We need to access your photo library to let you select a profile picture.</string>
  </edit-config>
`);
