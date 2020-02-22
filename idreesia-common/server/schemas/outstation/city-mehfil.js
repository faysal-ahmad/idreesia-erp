import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  name: {
    type: String,
  },
  cityId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
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
})
  .extend(identifiable)
  .extend(timestamps);
