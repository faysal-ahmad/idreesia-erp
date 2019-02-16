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
  voucherId: {
    type: String,
  },
  amount: {
    type: Number,
  },
  transactionType: {
    type: String,
  },
  categoryId: {
    type: String,
    optional: true,
  },
  order: {
    type: Number,
  },
})
  .extend(identifiable)
  .extend(timestamps);
