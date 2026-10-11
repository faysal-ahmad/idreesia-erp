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
  members: {
    type: Array,
    optional: true,
  },
  'members.$': {
    type: Object,
  },
  'members.$.karkunId': {
    type: String,
  },
  'members.$.isCoordinator': {
    type: Boolean,
    optional: true,
  },
  // Missing means the member is available every day.
  'members.$.daysOfWeek': {
    type: Array,
    optional: true,
    minCount: 1,
  },
  'members.$.daysOfWeek.$': {
    type: String,
    allowedValues: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  },
  dutyId: {
    type: String,
  },
})
  .extend(identifiable)
  .extend(timestamps);
