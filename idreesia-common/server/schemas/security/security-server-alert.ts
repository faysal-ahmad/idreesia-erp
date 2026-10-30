import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

// An alert raised by the security server and pushed to the ERP. Profile and
// channel names are copied in so lists need no joins and still read correctly
// after either is deleted.
export default new SimpleSchema({
  // The security server's own alert id; pushes upsert on it.
  externalId: {
    type: String,
  },
  profileId: {
    type: String,
  },
  profileName: {
    type: String,
  },
  profileIsTest: {
    type: Boolean,
  },
  channelId: {
    type: String,
  },
  channelName: {
    type: String,
  },
  timestamp: {
    type: Date,
  },
  similarityScore: {
    type: Number,
  },
  // The matched face's shorter side in camera pixels, and its quality (0-100)
  // with the reasons it scored low. Missing on alerts raised before the
  // security server checked faces.
  faceSizePx: {
    type: Number,
    optional: true,
  },
  faceQualityScore: {
    type: Number,
    optional: true,
  },
  faceQualityReasons: {
    type: Array,
    optional: true,
  },
  'faceQualityReasons.$': {
    type: String,
  },
  // Object storage key, under StorageFolders.SecurityServerAlertImages.
  imageKey: {
    type: String,
  },
  // A list-sized JPEG of the image, stored next to it. Missing when it could
  // not be made; the lists then show the full image.
  thumbnailKey: {
    type: String,
    optional: true,
  },
  review: {
    type: String,
    optional: true,
    allowedValues: ['CORRECT', 'FALSE_POSITIVE'],
  },
  reviewedAt: {
    type: Date,
    optional: true,
  },
})
  .extend(identifiable)
  .extend(timestamps);
