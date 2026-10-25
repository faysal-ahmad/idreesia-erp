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
  // Bumped on every review change, including clearing one - the cursor the
  // security server pages review decisions by.
  reviewUpdatedAt: {
    type: Date,
    optional: true,
  },
})
  .extend(identifiable)
  .extend(timestamps);
