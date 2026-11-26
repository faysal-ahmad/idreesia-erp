import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';
import { PettyCashVoucherLine } from './lines';

export default new SimpleSchema({
  number: { type: String },
  fundId: { type: String },
  // The expense head every line of the voucher is booked to.
  expenseHeadId: { type: String },
  voucherDate: { type: Date },
  // Who was paid (free text), optionally a registered vendor.
  payee: { type: String, optional: true },
  vendorId: { type: String, optional: true },
  purpose: { type: String, optional: true },
  lines: { type: Array },
  'lines.$': { type: PettyCashVoucherLine },
  total: { type: Number, min: 0 },
  status: { type: String },
  version: { type: SimpleSchema.Integer },
  submittedAt: { type: Date, optional: true },
  submittedBy: { type: String, optional: true },
  approvedAt: { type: Date, optional: true },
  approvedBy: { type: String, optional: true },
  rejectedAt: { type: Date, optional: true },
  rejectedBy: { type: String, optional: true },
  rejectionReason: { type: String, optional: true },
  voidedAt: { type: Date, optional: true },
  voidedBy: { type: String, optional: true },
  voidReason: { type: String, optional: true },
  // The replenishment that bundles this voucher.
  replenishmentId: { type: String, optional: true },
})
  .extend(identifiable)
  .extend(timestamps);
