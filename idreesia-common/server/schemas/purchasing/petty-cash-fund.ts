import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  name: { type: String },
  // The karkun (person) holding the cash.
  custodianPersonId: { type: String },
  floatAmount: { type: Number, min: 0 },
  // Largest single voucher allowed. Missing means no limit.
  perTransactionLimit: { type: Number, min: 0, optional: true },
  // Cash the fund holds on the books.
  balance: { type: Number },
  isActive: { type: Boolean },
  notes: { type: String, optional: true },
  version: { type: SimpleSchema.Integer },
})
  .extend(identifiable)
  .extend(timestamps);
