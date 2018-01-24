import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
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
  }
})
  .extend(identifiable)
  .extend(timestamps);
