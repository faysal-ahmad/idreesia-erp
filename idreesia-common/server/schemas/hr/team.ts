import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  name: {
    type: String,
  },
  color: {
    type: String,
    optional: true,
  },
  description: {
    type: String,
    optional: true,
  },
  karkunIds: {
    type: Array,
    optional: true,
  },
  'karkunIds.$': {
    type: String,
  },
  coordinatorKarkunIds: {
    type: Array,
    optional: true,
  },
  'coordinatorKarkunIds.$': {
    type: String,
  },
  memberSchedules: {
    type: Array,
    optional: true,
  },
  'memberSchedules.$': {
    type: Object,
  },
  'memberSchedules.$.karkunId': {
    type: String,
  },
  'memberSchedules.$.daysOfWeek': {
    type: Array,
    minCount: 1,
  },
  'memberSchedules.$.daysOfWeek.$': {
    type: String,
    allowedValues: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  },
  dutyId: {
    type: String,
  },
})
  .extend(identifiable)
  .extend(timestamps);
