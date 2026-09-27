# Local Cordova plugins

Cordova plugins written for this repo, referenced from
`idreesia-mobile/.meteor/cordova-plugins` with a `file://` path. They live
outside `idreesia-mobile/` so Meteor doesn't try to bundle their files.

| Plugin | Why |
|--------|-----|
| `idreesia-webview-camera` | iOS: lets the in-app camera (`getUserMedia`) run without WKWebView's extra per-launch "localhost would like to access the camera" prompt. |

After changing a plugin, remove `idreesia-mobile/.meteor/local/cordova-build`
so Meteor reinstalls it on the next device run.
