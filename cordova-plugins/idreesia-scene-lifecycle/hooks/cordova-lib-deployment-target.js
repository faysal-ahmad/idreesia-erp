// Xcode 27 only builds for iOS 15 and later, but cordova-ios 7's CordovaLib
// project targets iOS 11 and fails to build. mobile-config.js's
// `deployment-target` preference only reaches the app target, so this raises
// CordovaLib's IPHONEOS_DEPLOYMENT_TARGET to the same minimum after every
// prepare. Remove together with this plugin once Meteor uses cordova-ios 8.

const fs = require('fs');
const path = require('path');

const MIN_TARGET = 15.0;

module.exports = context => {
  const pbxproj = path.join(
    context.opts.projectRoot,
    'platforms',
    'ios',
    'CordovaLib',
    'CordovaLib.xcodeproj',
    'project.pbxproj'
  );
  if (!fs.existsSync(pbxproj)) return;

  const original = fs.readFileSync(pbxproj, 'utf8');
  const updated = original.replace(
    /IPHONEOS_DEPLOYMENT_TARGET = ([0-9.]+);/g,
    (match, version) =>
      parseFloat(version) < MIN_TARGET
        ? `IPHONEOS_DEPLOYMENT_TARGET = ${MIN_TARGET.toFixed(1)};`
        : match
  );
  if (updated !== original) {
    fs.writeFileSync(pbxproj, updated);
    console.log(`idreesia-scene-lifecycle: CordovaLib deployment target raised to ${MIN_TARGET.toFixed(1)}`);
  }
};
