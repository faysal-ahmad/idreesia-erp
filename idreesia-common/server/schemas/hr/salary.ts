import SimpleSchema from 'simpl-schema';

import { approvable, identifiable, timestamps } from '../common';

export default new SimpleSchema({
  karkunId: {
    type: String,
  },
  jobId: {
    type: String,
    optional: true,
  },
  month: {
    type: String,
    optional: true,
  },
  salary: {
    type: Number,
    optional: true,
  },
  openingLoan: {
    type: Number,
    optional: true,
  },
  loanDeduction: {
    type: Number,
    optional: true,
  },
  newLoan: {
    type: Number,
    optional: true,
  },
  closingLoan: {
    type: Number,
    optional: true,
  },
  otherDeduction: {
    type: Number,
    optional: true,
  },
  arrears: {
    type: Number,
    optional: true,
  },
  netPayment: {
    type: Number,
    optional: true,
  },
  rashanMadad: {
    type: Number,
    optional: true,
  },
})
  .extend(approvable)
  .extend(identifiable)
  .extend(timestamps);
