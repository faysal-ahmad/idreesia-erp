import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  version: {
    type: Number,
  },
  paymentId: {
    type: String,
  },
  name: {
    type: String,
    optional: true,
  },
  fatherName: {
    type: String,
    optional: true,
  },
  cnicNumber: {
    type: String,
    optional: true,
  },
  contactNumber: {
    type: String,
    optional: true,
  },
  paymentNumber: {
    type: Number,
  },
  paymentType: {
    type: String,
    allowedValues: ['IPT', 'OPT'],
  },
  paymentAmount: {
    type: Number,
  },
  paymentDate: {
    type: Date,
  },
  description: {
    type: String,
    optional: true,
  },
  isDeleted: {
    type: Boolean,
    optional: true,
  },
  approvedBy: {
    type: String,
    optional: true,
  },
})
  .extend(identifiable)
  .extend(timestamps);
