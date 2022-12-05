import SimpleSchema from 'simpl-schema';

import { approvable, identifiable, timestamps } from '../common';

export default new SimpleSchema({
  wazeefaId: {
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
  adjustmentReason: {
    type: String,
    optional: true,
  },
})
  .extend(approvable)
  .extend(identifiable)
  .extend(timestamps);
