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
// Xcode 27 builds for iOS 15 and later only; Cordova's template says 11.
App.setPreference('deployment-target', '15.0', 'ios');
// The in-app camera (imports/ui/components/camera-view.tsx) plays its live
// preview in a <video>; without this iOS forces it into a fullscreen player.
App.setPreference('AllowInlineMediaPlayback', 'true');
App.setPreference('DisallowOverscroll', true);
// Keep in sync with palette.background in imports/ui/theme/theme.ts (build-time
// config can't import app code).
App.setPreference('BackgroundColor', '0xfff3f6f4');

// Camera (visitor photo search): the in-app camera on iOS, with
// cordova-plugins/idreesia-webview-camera, and cordova-plugin-camera on
// Android. iOS refuses camera access without a usage description; Android's
// CAMERA permission comes from cordova-plugin-camera.
App.appendToConfig(`
  <edit-config target="NSCameraUsageDescription" file="*-Info.plist" mode="merge">
    <string>Idreesia uses the camera to take a visitor's photo for searching.</string>
  </edit-config>
`);
