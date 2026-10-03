import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  dutyId: {
    type: String,
  },
  locationId: {
    type: String,
  },
  startDate: {
    type: String,
  },
  endDate: {
    type: String,
    optional: true,
  },
  status: {
    type: String,
    allowedValues: ['active', 'archived'],
  },
})
  .extend(identifiable)
  .extend(timestamps);
