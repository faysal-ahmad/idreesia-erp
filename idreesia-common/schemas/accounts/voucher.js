import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  companyId: {
    type: String,
  },
  externalReferenceId: {
    type: String,
    optional: true,
  },
  voucherNumber: {
    type: String,
  },
  voucherDate: {
    type: Date,
  },
  description: {
    type: String,
    optional: true,
  },
  order: {
    type: Number,
  },
})
  .extend(identifiable)
  .extend(timestamps);
