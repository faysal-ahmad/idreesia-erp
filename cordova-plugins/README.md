# Local Cordova plugins

Cordova plugins written for this repo, referenced from
`idreesia-mobile/.meteor/cordova-plugins` with a `file://` path. They live
outside `idreesia-mobile/` so Meteor doesn't try to bundle their files.

| Plugin | Why |
|--------|-----|
| `idreesia-webview-camera` | iOS: lets the in-app camera and the chat's voice notes (`getUserMedia`) run without WKWebView's extra per-launch "localhost would like to access the camera/microphone" prompt. Android: declares `RECORD_AUDIO` for voice notes (requested at runtime via `cordova-plugin-android-permissions`). |
| `idreesia-scene-lifecycle` | iOS: adopts the UIKit scene life cycle, without which apps built with Xcode 27 (iOS 27 SDK) don't launch, and raises CordovaLib's iOS 11 deployment target to 15.0, which Xcode 27 refuses to build. Meteor 3.5/3.6 builds with cordova-ios 7.1.1, which predates scenes. **Remove once Meteor builds with cordova-ios 8** (check `CORDOVA_PLATFORM_VERSIONS` in Meteor's `tools/cordova/index.js`). |

After changing a plugin, remove `idreesia-mobile/.meteor/local/cordova-build`
so Meteor reinstalls it on the next device run.

**Meteor 3.5 bug when regenerating `cordova-build`:** with `file://` plugins
already listed, adding a platform fails with npm `EINVALIDPACKAGENAME`
(`../../../../cordova-plugins/...`). Meteor copies npm's link entries for
local plugins into `package.json` as package names. Work around it by
building once with the `file://` lines removed from
`idreesia-mobile/.meteor/cordova-plugins` (so the platforms get added), then
restoring them and building again.
