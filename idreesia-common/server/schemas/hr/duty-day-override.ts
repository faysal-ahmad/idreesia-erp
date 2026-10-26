import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  dutyId: {
    type: String,
  },
  locationId: {
    type: String,
  },
  shiftId: {
    type: String,
  },
  date: {
    type: String,
  },
  addedKarkunIds: {
    type: Array,
    optional: true,
  },
  'addedKarkunIds.$': {
    type: String,
  },
  absentKarkunIds: {
    type: Array,
    optional: true,
  },
  'absentKarkunIds.$': {
    type: String,
  },
})
  .extend(identifiable)
  .extend(timestamps);
