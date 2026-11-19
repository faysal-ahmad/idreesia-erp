# Mobile release builds

When a PR is merged into `master`, `.github/workflows/release.yml` builds the
mobile app (`idreesia-mobile`) after the ERP release job succeeds:

- `mobile-android` (ubuntu): signed `.aab` (Google Play) and `.apk` (direct install).
- `mobile-ios` (macOS): signed App Store `.ipa`.

Both check out the release tag (`v<version>`), use the release version as the
app version, and use the workflow run number as the store build number (see
`mobile-config.js`). The files are attached to the workflow run as artifacts, and
the `github-release` job also attaches them to a GitHub Release for the tag.
Uploading to Google Play / App Store Connect is still manual.

## Production URLs

Set in the `env:` block at the top of `release.yml`: `MOBILE_SERVER_URL`
(`meteor build --server`), `MOBILE_BACKEND_URL` (`public.backendUrl`) and
`MOBILE_ROCKETCHAT_URL` (`public.rocketChatUrl`).

## Repository secrets

How to create each one: [mobile-signing-setup.md](mobile-signing-setup.md).

Android: `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`,
`ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`.

iOS: `IOS_CERTIFICATE_P12_BASE64` (Apple Distribution certificate),
`IOS_CERTIFICATE_PASSWORD`, `IOS_PROVISIONING_PROFILE_BASE64` (App Store
profile for `com.easternbreeze.erp`), `IOS_TEAM_ID`.

Encode files with `base64 -i file | pbcopy`.

## App icons and launch screens

Everything lives in `idreesia-mobile/resources/` and is wired up in
`idreesia-mobile/mobile-config.js`.

- **iOS icons** (`resources/icons/ios-*.png`): all are opaque (the App Store
  rejects transparency). The 1024 px `ios-app_store.png` is the master; the
  smaller and legacy sizes are downscaled from it. Legacy sizes are listed in
  `mobile-config.js` so the Xcode asset catalog does not keep Meteor's default
  logo in those slots. Only the Apple Watch slots still hold it, and the app has
  no watch target.
- **Android icons:** `android_*.png` are the plain round icons (Android 7 and
  older). `android-adaptive-foreground-*.png` and
  `android-adaptive-background-*.png` make the adaptive icon (Android 8+): the
  emblem sits inside the 66dp safe zone of a 108dp canvas, on a solid
  `#F1F6F5` background. Cordova rejects a colour code as the background, hence
  the background images.
- **Launch screens:** `resources/launch-screens/`.
- If the emblem changes, regenerate the sizes above, then run a local
  `meteor build` for each platform and check the icons in the output.

## Store listing checklist

These are uploaded in the store consoles, not built into the app.

**Google Play Console**

- 512x512 app icon (PNG, 32-bit, no rounded corners; Play rounds it).
- 1024x500 feature graphic.
- At least two phone screenshots (more for tablets if you target them).
- Short description (80 characters) and full description.
- Privacy policy URL.
- Data safety form and content rating questionnaire. The app uses the camera
  and microphone and sends data to the ERP backend, so declare those.
- Play App Signing: on the first upload, enrol and register the upload key (the
  keystore from the signing setup).

**App Store Connect**

- Screenshots for the required iPhone sizes (and iPad if the app supports it).
- Description, keywords, support URL, and category.
- Privacy policy URL and the App Privacy answers (camera, microphone, and data
  sent to the backend).
- Age rating questionnaire and export compliance answers (the app uses HTTPS
  only).
- Review notes with a demo login, because the app needs an account to get past
  the sign-in screen.

## Known build quirks

- **Fresh Cordova project:** Meteor 3.5 cannot create the Cordova project from
  scratch while `idreesia-mobile/.meteor/cordova-plugins` lists `file://`
  plugins (see [cordova-plugins/README.md](../cordova-plugins/README.md)). A CI
  runner always starts fresh, so both mobile jobs first run
  `scripts/prepare-cordova-project.sh`, which builds once without those lines
  and restores the file. This adds about a minute on iOS and a few minutes on
  Android (the extra build compiles the app). It can go once Meteor fixes the
  bug.
- **Release-only settings:** `MOBILE_RELEASE=true` (set by the workflow) leaves
  the development-only Local Network text out of `Info.plist`.
