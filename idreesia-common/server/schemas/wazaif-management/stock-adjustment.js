import SimpleSchema from 'simpl-schema';

import { approvable, identifiable, timestamps } from '../common';

export default new SimpleSchema({
  wazeefaId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  adjustmentDate: {
    type: Date,
  },
  adjustedBy: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
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
