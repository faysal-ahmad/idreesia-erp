import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  name: { type: String },
  contactPerson: { type: String, optional: true },
  phone: { type: String, optional: true },
  email: { type: String, optional: true },
  address: { type: String, optional: true },
  // Tax registration number (NTN).
  taxId: { type: String, optional: true },
  paymentTermsDays: { type: SimpleSchema.Integer, optional: true, min: 0 },
  bankName: { type: String, optional: true },
  bankAccountTitle: { type: String, optional: true },
  bankAccountNumber: { type: String, optional: true },
  notes: { type: String, optional: true },
  isActive: { type: Boolean },
})
  .extend(identifiable)
  .extend(timestamps);
