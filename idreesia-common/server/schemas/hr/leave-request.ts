import SimpleSchema from 'simpl-schema';

import { LEAVE_REQUEST_STATUSES } from 'meteor/idreesia-common/constants/hr/employment';

import { identifiable, timestamps } from '../common';

// A leave request, entered by HR and approved by HR.
export default new SimpleSchema({
  personId: {
    type: String,
  },
  leaveTypeId: {
    type: String,
  },
  // Calendar dates (YYYY-MM-DD), both included, in one calendar year.
  fromDate: {
    type: String,
  },
  toDate: {
    type: String,
  },
  halfDay: {
    type: Boolean,
  },
  // Working days the request covers, fixed when it is created.
  days: {
    type: Number,
  },
  reason: {
    type: String,
    optional: true,
  },
  status: {
    type: String,
    allowedValues: [...LEAVE_REQUEST_STATUSES],
  },
  // Who HR checked with before deciding (defaults to the employee's
  // reports-to). Optional and informational.
  confirmedWithPersonId: {
    type: String,
    optional: true,
  },
  confirmedOn: {
    type: Date,
    optional: true,
  },
  confirmationRemarks: {
    type: String,
    optional: true,
  },
  approvedAt: {
    type: Date,
    optional: true,
  },
  approvedBy: {
    type: String,
    optional: true,
  },
  rejectedAt: {
    type: Date,
    optional: true,
  },
  rejectedBy: {
    type: String,
    optional: true,
  },
  rejectionReason: {
    type: String,
    optional: true,
  },
  cancelledAt: {
    type: Date,
    optional: true,
  },
  cancelledBy: {
    type: String,
    optional: true,
  },
  version: {
    type: SimpleSchema.Integer,
  },
})
  .extend(identifiable)
  .extend(timestamps);
