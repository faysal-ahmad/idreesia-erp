import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';
import { InvoiceLine } from './lines';

export default new SimpleSchema({
  number: { type: String },
  vendorInvoiceNo: { type: String },
  vendorId: { type: String },
  // Legacy: invoices made before lines were billed per order.
  orderId: { type: String, optional: true },
  // Every order the invoice's lines are billed against.
  orderIds: { type: Array, optional: true },
  'orderIds.$': { type: String },
  invoiceDate: { type: Date },
  dueDate: { type: Date },
  notes: { type: String, optional: true },
  lines: { type: Array },
  'lines.$': { type: InvoiceLine },
  subtotal: { type: Number, min: 0 },
  taxTotal: { type: Number, min: 0 },
  total: { type: Number, min: 0 },
  paidAmount: { type: Number, min: 0 },
  status: { type: String },
  // The invoice was accepted although it bills more than was received, or
  // someone flagged it as disputed.
  isDisputed: { type: Boolean },
  voidedAt: { type: Date, optional: true },
  voidedBy: { type: String, optional: true },
})
  .extend(identifiable)
  .extend(timestamps);
