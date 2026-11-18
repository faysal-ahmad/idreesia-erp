import SimpleSchema from 'simpl-schema';

import { DutyAttendanceStatusValues } from 'meteor/idreesia-common/constants/duties-attendance';
import { identifiable, timestamps } from '../common';

const RecordKarkunSchema = new SimpleSchema({
  karkunId: { type: String },
  name: { type: String, optional: true },
  addedForDay: { type: Boolean },
  attendance: {
    type: String,
    optional: true,
    allowedValues: DutyAttendanceStatusValues,
  },
  attendanceUpdatedAt: { type: Date, optional: true },
  attendanceUpdatedBy: { type: String, optional: true },
});

export default new SimpleSchema({
  workspaceId: { type: String },
  dutyId: { type: String },
  // YYYY-MM-DD, Asia/Karachi.
  date: { type: String },
  karkuns: { type: Array },
  'karkuns.$': { type: RecordKarkunSchema },
})
  .extend(identifiable)
  .extend(timestamps);
