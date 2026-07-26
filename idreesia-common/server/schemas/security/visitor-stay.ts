import SimpleSchema from 'simpl-schema';

import { identifiable } from '../common';

export default new SimpleSchema({
  visitorId: {
    type: String,
  },
  fromDate: {
    type: Date,
  },
  toDate: {
    type: Date,
  },
  numOfDays: {
    type: Number,
  },
  stayReason: {
    type: String,
    optional: true,
  },
  stayAllowedBy: {
    type: String,
    optional: true,
  },
  dutyId: {
    type: String,
    optional: true,
  },
  shiftId: {
    type: String,
    optional: true,
  },
  cancelledDate: {
    type: Date,
    optional: true,
  },
}).extend(identifiable);
