import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';
import { OrderLine } from './lines';

export default new SimpleSchema({
  number: { type: String },
  vendorId: { type: String },
  requisitionId: { type: String, optional: true },
  quoteId: { type: String, optional: true },
  orderDate: { type: Date },
  expectedDeliveryDate: { type: Date, optional: true },
  deliveryAddress: { type: String, optional: true },
  paymentTermsDays: { type: SimpleSchema.Integer, optional: true, min: 0 },
  notes: { type: String, optional: true },
  lines: { type: Array },
  'lines.$': { type: OrderLine },
  subtotal: { type: Number, min: 0 },
  taxTotal: { type: Number, min: 0 },
  discount: { type: Number, min: 0 },
  shipping: { type: Number, min: 0 },
  total: { type: Number, min: 0 },
  status: { type: String },
  version: { type: SimpleSchema.Integer },
  submittedAt: { type: Date, optional: true },
  submittedBy: { type: String, optional: true },
  approvedAt: { type: Date, optional: true },
  approvedBy: { type: String, optional: true },
  rejectionReason: { type: String, optional: true },
  sentAt: { type: Date, optional: true },
  sentBy: { type: String, optional: true },
  closedAt: { type: Date, optional: true },
  closedBy: { type: String, optional: true },
  cancelledAt: { type: Date, optional: true },
  cancelledBy: { type: String, optional: true },
})
  .extend(identifiable)
  .extend(timestamps);
