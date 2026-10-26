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
})
  .extend(identifiable)
  .extend(timestamps);
