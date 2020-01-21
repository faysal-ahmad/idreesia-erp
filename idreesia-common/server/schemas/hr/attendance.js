import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  karkunId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  dutyId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },
  shiftId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },
  jobId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },
  month: {
    type: String,
    optional: true,
  },
  attendanceDetails: {
    type: String,
    optional: true,
  },
  presentCount: {
    type: Number,
    optional: true,
  },
  lateCount: {
    type: Number,
    optional: true,
  },
  absentCount: {
    type: Number,
    optional: true,
  },
  percentage: {
    type: Number,
    optional: true,
  },
  meetingCardBarcodeId: {
    type: String,
  },
})
  .extend(identifiable)
  .extend(timestamps);
