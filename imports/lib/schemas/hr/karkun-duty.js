import SimpleSchema from 'simpl-schema';

import { identifiable } from '../common';

export default new SimpleSchema({
  karkunId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  dutyId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  locationId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
  startTime: {
    type: String,
    optional: true
  },
  endTime: {
    type: String,
    optional: true
  },
  startDate: {
    type: Date,
    optional: true
  },
  endDate: {
    type: Date,
    optional: true
  },
  daysOfWeek: {
    type: Array,
    optional: true
  },
  'daysOfWeek.$': {
    type: String,
    allowedValues: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  }
}).extend(identifiable);