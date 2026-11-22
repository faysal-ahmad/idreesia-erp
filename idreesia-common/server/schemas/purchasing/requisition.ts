import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';
import { RequisitionLine } from './lines';

export default new SimpleSchema({
  number: { type: String },
  title: { type: String },
  purpose: { type: String, optional: true },
  requestedBy: { type: String, optional: true },
  neededBy: { type: Date, optional: true },
  lines: { type: Array },
  'lines.$': { type: RequisitionLine },
  estimatedTotal: { type: Number, min: 0 },
  status: { type: String },
  version: { type: SimpleSchema.Integer },
  submittedAt: { type: Date, optional: true },
  submittedBy: { type: String, optional: true },
  approvedAt: { type: Date, optional: true },
  approvedBy: { type: String, optional: true },
  rejectedAt: { type: Date, optional: true },
  rejectedBy: { type: String, optional: true },
  rejectionReason: { type: String, optional: true },
  cancelledAt: { type: Date, optional: true },
  cancelledBy: { type: String, optional: true },
})
  .extend(identifiable)
  .extend(timestamps);
