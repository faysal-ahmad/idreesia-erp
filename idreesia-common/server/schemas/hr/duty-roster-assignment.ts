import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  rosterId: {
    type: String,
  },
  shiftId: {
    type: String,
  },
  dayOfWeek: {
    type: String,
    optional: true,
    allowedValues: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  },
  assigneeType: {
    type: String,
    allowedValues: ['team', 'karkun'],
  },
  teamId: {
    type: String,
    optional: true,
  },
  karkunId: {
    type: String,
    optional: true,
  },
})
  .extend(identifiable)
  .extend(timestamps);
