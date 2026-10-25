import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

// Mirror of a security-server Alert. Profile and channel names are copied in
// so lists need no joins and still read correctly after either is deleted.
export default new SimpleSchema({
  externalId: {
    type: String,
  },
  profileId: {
    type: String,
  },
  profileExternalId: {
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
  channelExternalId: {
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
  // Object storage key, under StorageFolders.SecurityServerAlertImages.
  imageKey: {
    type: String,
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
