import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  sharedResidenceId: {
    type: String,
  },
  residentId: {
    type: String,
  },
  isOwner: {
    type: Boolean,
  },
  roomNumber: {
    type: Number,
    optional: true,
  },
  fromDate: {
    type: Date,
    optional: true,
  },
  toDate: {
    type: Date,
    optional: true,
  },
})
  .extend(identifiable)
  .extend(timestamps);
