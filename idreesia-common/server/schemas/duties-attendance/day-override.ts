import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  locationId: { type: String },
  dutyId: { type: String },
  // YYYY-MM-DD, Asia/Karachi.
  date: { type: String },
  addedKarkunIds: { type: Array, optional: true },
  'addedKarkunIds.$': { type: String },
  absentKarkunIds: { type: Array, optional: true },
  'absentKarkunIds.$': { type: String },
})
  .extend(identifiable)
  .extend(timestamps);
