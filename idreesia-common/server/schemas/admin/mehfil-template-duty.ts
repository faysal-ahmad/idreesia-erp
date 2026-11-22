import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

// A duty name that every mehfil's Duties and Attendance can choose from.
export default new SimpleSchema({
  name: {
    type: String,
  },
  description: {
    type: String,
    optional: true,
  },
})
  .extend(identifiable)
  .extend(timestamps);
