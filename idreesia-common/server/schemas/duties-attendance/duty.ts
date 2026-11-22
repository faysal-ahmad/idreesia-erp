import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

const MemberSchema = new SimpleSchema({
  karkunId: { type: String },
  isCoordinator: { type: Boolean, optional: true },
  canMarkOwnAttendance: { type: Boolean, optional: true },
  // Days the member is on duty. Empty or missing: every day.
  daysOfWeek: { type: Array, optional: true },
  'daysOfWeek.$': { type: String },
});

export default new SimpleSchema({
  locationId: {
    type: String,
  },
  // The mehfil template duty (admin Mehfil Templates) this is a duty of. Its
  // name and description are read from there, never copied.
  mehfilDutyId: {
    type: String,
  },
  // First day the duty is planned (YYYY-MM-DD, Asia/Karachi): the day after it
  // was created or last made active. Earlier days never get a record.
  startDate: {
    type: String,
    optional: true,
  },
  // An inactive duty is no longer planned (no new day records).
  isActive: {
    type: Boolean,
    optional: true,
  },
  members: {
    type: Array,
  },
  'members.$': {
    type: MemberSchema,
  },
})
  .extend(identifiable)
  .extend(timestamps);
