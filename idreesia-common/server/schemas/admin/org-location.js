import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

const MehfilSchema = new SimpleSchema({
  address: {
    type: String,
    optional: true,
  },
  mehfilStartYear: {
    type: String,
    optional: true,
  },
  timingDetails: {
    type: String,
    optional: true,
  },
  lcdAvailability: {
    type: Boolean,
    optional: true,
  },
  tabAvailability: {
    type: Boolean,
    optional: true,
  },
  otherMehfilDetails: {
    type: String,
    optional: true,
  },
});

export default new SimpleSchema({
  name: {
    type: String,
  },
  type: {
    type: String,
    allowedValues: ['Root', 'Mehfil', 'City', 'Country', 'Other'],
  },
  parentId: {
    type: String,
    optional: true,
  },
  allParentIds: {
    type: Array,
    optional: true,
  },
  'allParentIds.$': {
    type: String,
  },
  mehfilDetails: {
    type: MehfilSchema,
    optional: true,
  },
})
  .extend(identifiable)
  .extend(timestamps);
