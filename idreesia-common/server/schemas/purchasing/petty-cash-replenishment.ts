import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  number: { type: String },
  fundId: { type: String },
  voucherIds: { type: Array },
  'voucherIds.$': { type: String },
  // The sum of the bundled vouchers: the cash that goes back to the fund.
  amount: { type: Number, min: 0 },
  // Cash actually counted in the fund when requesting. Optional.
  countedCash: { type: Number, min: 0, optional: true },
  // countedCash minus the balance the books expected (negative = short).
  variance: { type: Number, optional: true },
  notes: { type: String, optional: true },
  status: { type: String },
  version: { type: SimpleSchema.Integer },
  approvedAt: { type: Date, optional: true },
  approvedBy: { type: String, optional: true },
  rejectedAt: { type: Date, optional: true },
  rejectedBy: { type: String, optional: true },
  rejectionReason: { type: String, optional: true },
})
  .extend(identifiable)
  .extend(timestamps);
