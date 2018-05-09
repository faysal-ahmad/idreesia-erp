import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  // Points to login account if one exists for this karkun
  userId: {
    type: String,
    optional: true
  },
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  cnicNumber: {
    type: String
  },
  address: {
    type: String,
    optional: true
  },
  primaryContactNumber: {
    type: String,
    optional: true
  },
  secondaryContactNumber: {
    type: String,
    optional: true
  },
  profilePicture: {
    type: String,
    optional: true
  }
})
  .extend(identifiable)
  .extend(timestamps);
