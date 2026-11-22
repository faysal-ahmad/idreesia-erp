import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';
import { PaymentAllocation } from './lines';

export default new SimpleSchema({
  number: { type: String },
  vendorId: { type: String },
  paymentDate: { type: Date },
  method: { type: String },
  reference: { type: String, optional: true },
  notes: { type: String, optional: true },
  amount: { type: Number, min: 0 },
  allocations: { type: Array },
  'allocations.$': { type: PaymentAllocation },
  status: { type: String },
  voidedAt: { type: Date, optional: true },
  voidedBy: { type: String, optional: true },
  voidReason: { type: String, optional: true },
})
  .extend(identifiable)
  .extend(timestamps);
