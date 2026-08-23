// Model files live in idreesia-common/private/models/ (checked into git) and are resolved via
// Assets.absoluteFilePath, Meteor's mechanism for getting a real filesystem path to a bundled
// binary asset - needed here because @u4/opencv4nodejs's cv.readNetFromONNX takes a path, not a
// buffer. idreesia-common is a Meteor package (see package.js), not the app - a package's own
// private/ files aren't auto-scanned the way an app's are, so each one must be explicitly
// registered via api.addFiles(path, 'server', { isAsset: true }) in package.js, and the asset
// path passed to Assets.* here must match that registered path exactly, "private/" prefix
// included (same convention already used by the 'private/auth/google.json' asset in this package).
export const YUNET_MODEL_PATH = Assets.absoluteFilePath(
  'private/models/face_detection_yunet_2023mar.onnx'
);
export const SFACE_MODEL_PATH = Assets.absoluteFilePath(
  'private/models/face_recognition_sface_2021dec.onnx'
);
