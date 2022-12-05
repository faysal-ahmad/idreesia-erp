import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  karkunId: {
    type: String,
  },
  month: {
    type: String,
  },
  dutyId: {
    type: String,
    optional: true,
  },
  shiftId: {
    type: String,
    optional: true,
  },
  jobId: {
    type: String,
    optional: true,
  },
  attendanceDetails: {
    type: String,
    optional: true,
  },
  msVisitCount: {
    type: Number,
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
    optional: true,
  },
})
  .extend(identifiable)
  .extend(timestamps);
