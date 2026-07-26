import SimpleSchema from 'simpl-schema';

import { approvable, identifiable, timestamps } from '../common';

export default new SimpleSchema({
  physicalStoreId: {
    type: String,
  },
  stockItemId: {
    type: String,
  },
  adjustmentDate: {
    type: Date,
  },
  adjustedBy: {
    type: String,
  },
  quantity: {
    type: Number,
  },
  isInflow: {
    type: Boolean,
  },
  adjustmentReason: {
    type: String,
    optional: true,
  },
})
  .extend(approvable)
  .extend(identifiable)
  .extend(timestamps);
