import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export const SecurityServerProfileImage = new SimpleSchema({
  externalId: {
    type: String,
  },
  // Object storage key, under StorageFolders.SecurityServerProfileImages.
  imageKey: {
    type: String,
  },
});

// Mirror of a security-server MonitoringProfile.
export default new SimpleSchema({
  externalId: {
    type: String,
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
  externalCreatedAt: {
    type: Date,
    optional: true,
  },
  externalUpdatedAt: {
    type: Date,
    optional: true,
  },
})
  .extend(identifiable)
  .extend(timestamps);
