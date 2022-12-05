import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  name: {
    type: String,
  },
  dutyId: {
    type: String,
  },
  startTime: {
    type: String,
    optional: true,
  },
  endTime: {
    type: String,
    optional: true,
  },
  attendanceSheet: {
    type: String,
    optional: true,
  },
})
  .extend(identifiable)
  .extend(timestamps);
