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

// Camera (visitor photo search, photos in the public chat): the in-app camera
// on iOS, with cordova-plugins/idreesia-webview-camera, and
// cordova-plugin-camera on Android. iOS refuses camera access without a usage
// description; Android's CAMERA permission comes from cordova-plugin-camera.
//
// Microphone (voice notes in the public chat, imports/ui/chat): iOS needs the
// usage description below; Android's RECORD_AUDIO is declared by
// idreesia-webview-camera and requested by cordova-plugin-android-permissions.
App.appendToConfig(`
  <edit-config target="NSCameraUsageDescription" file="*-Info.plist" mode="merge">
    <string>Idreesia uses the camera to take photos, such as a visitor's photo for searching or a photo you send in a message.</string>
  </edit-config>
  <edit-config target="NSMicrophoneUsageDescription" file="*-Info.plist" mode="merge">
    <string>Idreesia uses the microphone to record voice notes you send in a message.</string>
  </edit-config>
`);

// Local Network (iOS): during development the app talks to the developer's
// Mac by its LAN address (scripts/run-mobile-device.mjs) - the ERP backend,
// Rocket.Chat and the mobile server that delivers hot code push. iOS asks for
// this permission the first time; denying it silently stops hot code push.
// Production builds use public URLs and never show the prompt.
App.appendToConfig(`
  <edit-config target="NSLocalNetworkUsageDescription" file="*-Info.plist" mode="merge">
    <string>During development, Idreesia connects to the developer's computer on your network to load app updates and data.</string>
  </edit-config>
`);
