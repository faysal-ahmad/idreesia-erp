import SimpleSchema from 'simpl-schema';

import { identifiable } from '../common';

export default new SimpleSchema({
  karkunId: {
    type: String,
  },
  dutyId: {
    type: String,
  },
  shiftId: {
    type: String,
    optional: true,
  },
  locationId: {
    type: String,
    optional: true,
  },
  role: {
    type: String,
    optional: true,
  },
  daysOfWeek: {
    type: Array,
    optional: true,
  },
  'daysOfWeek.$': {
    type: String,
    allowedValues: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  },
}).extend(identifiable);
