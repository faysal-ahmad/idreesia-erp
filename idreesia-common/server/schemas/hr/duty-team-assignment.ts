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
  teamId: {
    type: String,
  },
  // First date (YYYY-MM-DD, Karachi) this team covers the shift.
  startDate: {
    type: String,
  },
})
  .extend(identifiable)
  .extend(timestamps);
