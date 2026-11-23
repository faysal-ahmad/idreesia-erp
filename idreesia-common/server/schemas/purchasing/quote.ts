import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';
import { QuoteLine } from './lines';

export default new SimpleSchema({
  requisitionId: { type: String, optional: true },
  vendorId: { type: String },
  reference: { type: String, optional: true },
  quoteDate: { type: Date },
  validUntil: { type: Date, optional: true },
  lines: { type: Array },
  'lines.$': { type: QuoteLine },
  total: { type: Number, min: 0 },
  status: { type: String },
  notes: { type: String, optional: true },
  version: { type: SimpleSchema.Integer },
})
  .extend(identifiable)
  .extend(timestamps);
