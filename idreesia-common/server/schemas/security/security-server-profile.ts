import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export const SecurityServerProfileImage = new SimpleSchema({
  // Also the image id the security server sees.
  _id: {
    type: String,
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

// A person on the security server's watch list. Managed in the ERP and pulled
// down by the security server.
export default new SimpleSchema({
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
