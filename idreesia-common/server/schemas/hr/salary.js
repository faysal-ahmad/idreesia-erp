import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  karkunId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
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
  salary: {
    type: Number,
    optional: true,
  },
  openingLoan: {
    type: Number,
    optional: true,
  },
  deduction: {
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
  netPayment: {
    type: Number,
    optional: true,
  },
})
  .extend(identifiable)
  .extend(timestamps);
