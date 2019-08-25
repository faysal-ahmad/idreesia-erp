const appStoreIcon = 'private/assets/icon.png';
const iosIconsFolder = 'private/assets/icon/ios';
const androidIconsFolder = 'private/assets/icon/android';

App.info({
    version: '1.0.0',
    buildNumber: 1,
    description: 'Idreesia ERP Client',
    author: 'Faisal Ahmad',
    email: 'faisal.idreesi@gmail.com',
    website: 'https://idreesia.com',
});

// needs to be lower case because of iOS
App.setPreference('onesignalappid', '');

App.icons({
  app_store: appStoreIcon, // 1024x1024
  iphone_2x: `${iosIconsFolder}/icon-60@2x.png`, // 120x120
  iphone_3x: `${iosIconsFolder}/icon-60@3x.png`, // 180x180
  ipad_2x: `${iosIconsFolder}/icon-76@2x.png`, // 152x152
  ipad_pro: `${iosIconsFolder}/icon-83.5@2x.png`, // 167x167
  ios_settings_2x: `${iosIconsFolder}/icon-small@2x.png`, // 58x58
  ios_settings_3x: `${iosIconsFolder}/icon-small@3x.png`, // 87x87
  ios_spotlight_2x: `${iosIconsFolder}/icon-small-40@2x.png`, // 80x80
  ios_spotlight_3x: `${iosIconsFolder}/icon-small-40@3x.png`, // (120x120) // iPhone 6 Plus, 6s Plus, 7 Plus, 8 Plus, X
  ios_notification_2x: `${iosIconsFolder}/icon-small-40.png`, // 40x40
  ios_notification_3x: `${iosIconsFolder}/icon-60.png`, // 60x60
  ipad: `${iosIconsFolder}/icon-76.png`, // 76x76
  ios_settings: `${iosIconsFolder}/icon-small.png`, // 29x29
  ios_spotlight: `${iosIconsFolder}/icon-small-40.png`, // 40x40
  ios_notification: `${iosIconsFolder}/icon-small-40.png`, // 20x20
  iphone_legacy: `${iosIconsFolder}/icon.png`, // 57x57
  iphone_legacy_2x: `${iosIconsFolder}/icon@2x.png`, // 114x114
  ipad_spotlight_legacy: `${iosIconsFolder}/icon-small-50.png`, // 50x50
  ipad_spotlight_legacy_2x: `${iosIconsFolder}/icon-small-50@2x.png`, // 100x100
  ipad_app_legacy: `${iosIconsFolder}/icon-72.png`, // 72x72
  ipad_app_legacy_2x: `${iosIconsFolder}/icon-72@2x.png`, // 144x144
  android_mdpi: `${androidIconsFolder}/mdpi.png`, // 48x48
  android_hdpi: `${androidIconsFolder}/hdpi.png`, // 72x72
  android_xhdpi: `${androidIconsFolder}/xhdpi.png`, // 96x96
  android_xxhdpi: `${androidIconsFolder}/xxhdpi.png`, // 144x144
  android_xxxhdpi: `${androidIconsFolder}/xxxhdpi.png`, // 192x192
});

App.appendToConfig(`
  <edit-config target="NSCameraUsageDescription" file="*-Info.plist" mode="merge">
    <string>We need to access your camera to let you take profile pictures.</string>
  </edit-config>
  <edit-config target="NSPhotoLibraryUsageDescription" file="*-Info.plist" mode="merge">
    <string>We need to access your photo library to let you select a profile picture.</string>
  </edit-config>
`);
