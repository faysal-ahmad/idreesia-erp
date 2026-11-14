# Mobile release builds

When a PR is merged into `master`, `.github/workflows/release.yml` builds the
mobile app (`idreesia-mobile`) after the ERP release job succeeds:

- `mobile-android` (ubuntu): signed `.apk`.
- `mobile-ios` (macOS): signed App Store `.ipa`.

Both check out the release tag (`v<version>`), use the release version as the
app version, and use the workflow run number as the store build number (see
`mobile-config.js`). The files are attached to the workflow run as artifacts.
Uploading to Google Play / App Store Connect is still manual.

## Repository variables

| Name                    | Value                                                  |
| ----------------------- | ------------------------------------------------------ |
| `MOBILE_SERVER_URL`     | Mobile app's server URL (`meteor build --server`)      |
| `MOBILE_BACKEND_URL`    | ERP backend URL (`public.backendUrl`)                  |
| `MOBILE_ROCKETCHAT_URL` | Rocket.Chat URL (`public.rocketChatUrl`)               |

## Repository secrets

Android: `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`,
`ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`.

iOS: `IOS_CERTIFICATE_P12_BASE64` (Apple Distribution certificate),
`IOS_CERTIFICATE_PASSWORD`, `IOS_PROVISIONING_PROFILE_BASE64` (App Store
profile for `com.easternbreeze.erp`), `IOS_TEAM_ID`.

Encode files with `base64 -i file | pbcopy`.
