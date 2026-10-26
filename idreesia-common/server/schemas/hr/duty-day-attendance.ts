import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export const DUTY_ATTENDANCE_STATUSES = ['present', 'late', 'absent'] as const;

// Who was on duty for one shift at one location on one date, and how each
// karkun attended. Created at the start of the day, after which the plan for
// that day can no longer change.
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
  shiftName: {
    type: String,
  },
  date: {
    type: String,
  },
  karkuns: {
    type: Array,
  },
  'karkuns.$': {
    type: Object,
  },
  'karkuns.$.karkunId': {
    type: String,
  },
  'karkuns.$.name': {
    type: String,
  },
  'karkuns.$.teamId': {
    type: String,
    optional: true,
  },
  'karkuns.$.teamName': {
    type: String,
    optional: true,
  },
  'karkuns.$.addedForDay': {
    type: Boolean,
  },
  'karkuns.$.attendance': {
    type: String,
    optional: true,
    allowedValues: [...DUTY_ATTENDANCE_STATUSES],
  },
  'karkuns.$.attendanceUpdatedAt': {
    type: Date,
    optional: true,
  },
  'karkuns.$.attendanceUpdatedBy': {
    type: String,
    optional: true,
  },
})
  .extend(identifiable)
  .extend(timestamps);
