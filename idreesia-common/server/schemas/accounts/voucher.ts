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
    type: Number,
  },
  voucherType: {
    type: String,
    allowedValues: ['BPV', 'BRV', 'CPV', 'CRV', 'JV'],
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
  attachmentIds: {
    type: Array,
    optional: true,
  },
  'attachmentIds.$': {
    type: String,
  },
})
  .extend(identifiable)
  .extend(timestamps);
