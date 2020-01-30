import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  name: {
    type: String,
  },
  isMehfilDuty: {
    type: Boolean,
  },
  description: {
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
