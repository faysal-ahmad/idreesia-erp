App.info({
  id: 'com.easternbreeze.erp',
  name: 'Eastern Breeze ERP',
  description: 'Mobile client for Eastern Breeze ERP',
  author: 'Idreesia',
  email: 'support@idreesia.org',
  website: 'https://idreesia.org',
  // Overwritten by the CI release workflow (.github/workflows/release.yml),
  // which sets MOBILE_VERSION to the release version and MOBILE_BUILD_NUMBER to
  // the run number (iOS CFBundleVersion / Android versionCode; the stores need
  // it to increase on every upload). The fallbacks below are only used for local
  // builds, so there is no need to bump them for a release.
  version: process.env.MOBILE_VERSION || '1.0.1',
  buildNumber: process.env.MOBILE_BUILD_NUMBER || '1',
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
  // Legacy sizes. iOS 15+ never shows these, but without them the Xcode asset
  // catalog keeps Meteor's default comet logo in those slots.
  ios_settings: 'resources/icons/ios-ios_settings.png', // 29x29
  ios_spotlight: 'resources/icons/ios-ios_spotlight.png', // 40x40
  ios_notification: 'resources/icons/ios-ios_notification.png', // 20x20
  iphone_legacy: 'resources/icons/ios-iphone_legacy.png', // 57x57
  iphone_legacy_2x: 'resources/icons/ios-iphone_legacy_2x.png', // 114x114
  ipad_spotlight_legacy: 'resources/icons/ios-ipad_spotlight_legacy.png', // 50x50
  ipad_spotlight_legacy_2x: 'resources/icons/ios-ipad_spotlight_legacy_2x.png', // 100x100
  ipad_app_legacy: 'resources/icons/ios-ipad_app_legacy.png', // 72x72
  ipad_app_legacy_2x: 'resources/icons/ios-ipad_app_legacy_2x.png', // 144x144
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

// Android adaptive icon (Android 8+): the emblem on the app background colour.
// The foreground images are 108dp canvases with the emblem inside the 66dp safe
// zone, so launchers can mask the icon to any shape without clipping it. The
// plain icons above remain for Android 7 and older. Meteor has no API for
// adaptive icons, so they go in as raw config; the paths are relative to
// .meteor/local/cordova-build, where Cordova prepares the Android project.
// The background images are solid palette.background (#F1F6F5, kept in sync
// by hand like BackgroundColor); Cordova does not accept a colour code here.
App.appendToConfig(`
  <platform name="android">
    <icon density="mdpi" background="../../../resources/icons/android-adaptive-background-mdpi.png" foreground="../../../resources/icons/android-adaptive-foreground-mdpi.png" />
    <icon density="hdpi" background="../../../resources/icons/android-adaptive-background-hdpi.png" foreground="../../../resources/icons/android-adaptive-foreground-hdpi.png" />
    <icon density="xhdpi" background="../../../resources/icons/android-adaptive-background-xhdpi.png" foreground="../../../resources/icons/android-adaptive-foreground-xhdpi.png" />
    <icon density="xxhdpi" background="../../../resources/icons/android-adaptive-background-xxhdpi.png" foreground="../../../resources/icons/android-adaptive-foreground-xxhdpi.png" />
    <icon density="xxxhdpi" background="../../../resources/icons/android-adaptive-background-xxxhdpi.png" foreground="../../../resources/icons/android-adaptive-foreground-xxxhdpi.png" />
  </platform>
`);

// Launch screen: the Eastern Breeze emblem (public/images/eb-logo-emblem.png)
// centred on the app background. iOS fills the screen with a square image
// and crops the sides, so the emblem is small relative to the canvas. The iOS
// images also carry "EASTERN BREEZE" above the emblem and "FOUNDATION" below. Android
// 12+ shows a 288dp icon (masked to a 192dp circle) on a solid colour, so it
// has no room for text and stays emblem-only.
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
    <string>Eastern Breeze ERP uses the camera to take photos, that can be uploaded to discussions, meetings and document workspaces, and for video calls.</string>
  </edit-config>
  <edit-config target="NSMicrophoneUsageDescription" file="*-Info.plist" mode="merge">
    <string>Eastern Breeze ERP uses the microphone to record voice notes in discussion groups and for video calls.</string>
  </edit-config>
`);

// Location (attendance marked by the karkun themselves, imports/ui/apps/my-data):
// where they are when they mark it is kept with the attendance, and checked
// against the mehfil's geofence. It uses the WebView's own navigator.geolocation,
// so no plugin is needed: iOS needs the usage description, and on Android
// cordova-android asks for the location permission at the first request once
// the manifest declares it.
App.appendToConfig(`
  <edit-config target="NSLocationWhenInUseUsageDescription" file="*-Info.plist" mode="merge">
    <string>Eastern Breeze ERP uses your location when you mark your own attendance, to record where you were.</string>
  </edit-config>
  <platform name="android">
    <config-file target="AndroidManifest.xml" parent="/manifest">
      <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
      <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    </config-file>
  </platform>
`);

// Local Network (iOS): during development the app talks to the developer's
// Mac by its LAN address (scripts/run-mobile-device.mjs) - the ERP backend,
// Rocket.Chat and the mobile server that delivers hot code push. iOS asks for
// this permission the first time; denying it silently stops hot code push.
// Production builds use public URLs and never show the prompt, so the
// development-only text is left out of release builds. The CI release workflow
// sets MOBILE_RELEASE=true.
const isReleaseBuild = process.env.MOBILE_RELEASE === 'true';

if (!isReleaseBuild) {
  App.appendToConfig(`
  <edit-config target="NSLocalNetworkUsageDescription" file="*-Info.plist" mode="merge">
    <string>During development, Eastern Breeze ERP connects to the developer's computer on your network to load app updates and data.</string>
  </edit-config>
`);
}

// Export compliance (iOS): the app only uses HTTPS, which is exempt from the
// encryption export rules. Declaring that here stops App Store Connect from
// asking the export-compliance question on every uploaded build.
App.appendToConfig(`
  <edit-config target="ITSAppUsesNonExemptEncryption" file="*-Info.plist" mode="merge">
    <false/>
  </edit-config>
`);
