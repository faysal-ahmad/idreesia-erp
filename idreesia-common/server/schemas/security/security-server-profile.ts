import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export const SecurityServerProfileImage = new SimpleSchema({
  _id: {
    type: String,
  },
  // The security server's id for this image. Unset until the security server
  // has received it.
  externalId: {
    type: String,
    optional: true,
  },
  // Object storage key, under StorageFolders.SecurityServerProfileImages.
  imageKey: {
    type: String,
  },
  // A list-sized copy next to imageKey. Unset for photos stored before
  // thumbnails existed, or whose thumbnail failed: the list then uses the
  // full image.
  thumbnailKey: {
    type: String,
    optional: true,
  },
  uploadedAt: {
    type: Date,
  },
  uploadedBy: {
    type: String,
  },
});

// A person on the security server's watch list. Editable in both the ERP and
// the security server, and kept in step by the security server's two-way sync.
export default new SimpleSchema({
  // The security server's id for this profile. Unset until the security
  // server has received it.
  externalId: {
    type: String,
    optional: true,
  },
  name: {
    type: String,
  },
  isTest: {
    type: Boolean,
  },
  images: {
    type: Array,
  },
  'images.$': {
    type: SecurityServerProfileImage,
  },
  // The photo shown for the profile (one of `images`); no part in matching.
  // Unset = never chosen, or the chosen photo was removed: its oldest photo is
  // used instead. Synced with the security server.
  defaultImageId: {
    type: String,
    optional: true,
  },
})
  .extend(identifiable)
  .extend(timestamps);
