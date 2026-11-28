import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

// A manual change to an employee's leave balance for one type and year.
export default new SimpleSchema({
  personId: {
    type: String,
  },
  leaveTypeId: {
    type: String,
  },
  year: {
    type: SimpleSchema.Integer,
  },
  // Positive adds days, negative takes them away.
  days: {
    type: Number,
  },
  reason: {
    type: String,
  },
})
  .extend(identifiable)
  .extend(timestamps);
