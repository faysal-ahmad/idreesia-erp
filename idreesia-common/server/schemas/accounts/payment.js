import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  name: {
    type: String,
  },
  fatherName: {
    type: String,
  },
  cnicNumber: {
    type: String,
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
  isDeleted: {
    type: Boolean,
  },
  description: {
    type: String,
    optional: true,
  },
})
  .extend(identifiable)
  .extend(timestamps);
