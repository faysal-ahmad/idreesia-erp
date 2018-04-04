import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

const KarkunDuty = new SimpleSchema({
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
  daysOfWeek: {
    type: Array,
    optional: true
  },
  'daysOfWeek.$': {
    type: String,
    allowedValues: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  }
});

export default new SimpleSchema({
  // Points to login account if one exists for this karkun
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
  },
  duties: {
    type: Array,
    optional: true
  },
  'duties.$': {
    type: KarkunDuty
  }
})
  .extend(identifiable)
  .extend(timestamps);
