App.info({
  id: 'com.easternbreeze.erp',
  name: 'Eastern Breeze ERP',
  description: 'Mobile client for Eastern Breeze ERP',
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
App.setPreference('BackgroundColor', '0xfff1f6f5');

// App icon: the Eastern Breeze emblem (public/images/eb-logo-emblem.png). iOS
// icons are opaque (the App Store rejects transparency) on the app background,
// and iOS rounds the corners; Android's are the round emblem on transparent.
App.icons({
  app_store: 'resources/icons/ios-app_store.png', // 1024x1024
  iphone_2x: 'resources/icons/ios-iphone_2x.png', // 120x120
  iphone_3x: 'resources/icons/ios-iphone_3x.png', // 180x180
  ipad: 'resources/icons/ios-ipad.png', // 76x76
  ipad_2x: 'resources/icons/ios-ipad_2x.png', // 152x152
  ipad_pro: 'resources/icons/ios-ipad_pro.png', // 167x167
  ios_settings_2x: 'resources/icons/ios-ios_settings_2x.png', // 58x58
  ios_settings_3x: 'resources/icons/ios-ios_settings_3x.png', // 87x87
  ios_spotlight_2x: 'resources/icons/ios-ios_spotlight_2x.png', // 80x80
  ios_spotlight_3x: 'resources/icons/ios-ios_spotlight_3x.png', // 120x120
  ios_notification_2x: 'resources/icons/ios-ios_notification_2x.png', // 40x40
  ios_notification_3x: 'resources/icons/ios-ios_notification_3x.png', // 60x60
  android_mdpi: 'resources/icons/android_mdpi.png', // 48x48
  android_hdpi: 'resources/icons/android_hdpi.png', // 72x72
  android_xhdpi: 'resources/icons/android_xhdpi.png', // 96x96
  android_xxhdpi: 'resources/icons/android_xxhdpi.png', // 144x144
  android_xxxhdpi: 'resources/icons/android_xxxhdpi.png', // 192x192
});

// Launch screen: the Eastern Breeze emblem (public/images/eb-logo-emblem.png)
// centred on the app background. iOS fills the screen with a square image
// and crops the sides, so the emblem is small relative to the canvas. Android
// 12+ shows a 288dp icon (masked to a 192dp circle) on a solid colour.
App.launchScreens({
  ios_universal: 'resources/launch-screens/ios-universal.png', // 2732x2732
  ios_universal_3x: 'resources/launch-screens/ios-universal-3x.png', // 2208x2208
  android_universal: 'resources/launch-screens/android-universal.png', // 288dp @4x
});
// Keep in sync with palette.background, like BackgroundColor above.
App.setPreference('AndroidWindowSplashScreenBackground', '#F1F6F5', 'android');

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
    <string>Eastern Breeze ERP uses the camera to take photos, such as a visitor's photo for searching or a photo you send in a message.</string>
  </edit-config>
  <edit-config target="NSMicrophoneUsageDescription" file="*-Info.plist" mode="merge">
    <string>Eastern Breeze ERP uses the microphone to record voice notes and meeting audio.</string>
  </edit-config>
`);

// Local Network (iOS): during development the app talks to the developer's
// Mac by its LAN address (scripts/run-mobile-device.mjs) - the ERP backend,
// Rocket.Chat and the mobile server that delivers hot code push. iOS asks for
// this permission the first time; denying it silently stops hot code push.
// Production builds use public URLs and never show the prompt.
App.appendToConfig(`
  <edit-config target="NSLocalNetworkUsageDescription" file="*-Info.plist" mode="merge">
    <string>During development, Eastern Breeze ERP connects to the developer's computer on your network to load app updates and data.</string>
  </edit-config>
`);
