import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';
import { ReceiptLine } from './lines';

export default new SimpleSchema({
  number: { type: String },
  orderId: { type: String },
  vendorId: { type: String },
  // Only stored for store-raised documents (see RequisitionSource).
  source: { type: String, optional: true, allowedValues: ['store'] },
  externalSourceId: { type: String, optional: true },
  receivedDate: { type: Date },
  receivedBy: { type: String, optional: true },
  deliveryNoteNo: { type: String, optional: true },
  notes: { type: String, optional: true },
  lines: { type: Array },
  'lines.$': { type: ReceiptLine },
  status: { type: String },
  voidedAt: { type: Date, optional: true },
  voidedBy: { type: String, optional: true },
  voidReason: { type: String, optional: true },
})
  .extend(identifiable)
  .extend(timestamps);
