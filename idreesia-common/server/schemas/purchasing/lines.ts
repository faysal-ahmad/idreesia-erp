import SimpleSchema from 'simpl-schema';

// Line fields every document with lines shares. `description` and `unit` are
// snapshots: later catalog edits never change a document.
const baseLine = {
  _id: { type: String },
  catalogItemId: { type: String, optional: true },
  description: { type: String },
  unit: { type: String },
  quantity: { type: Number, min: 0 },
};

export const RequisitionLine = new SimpleSchema({
  ...baseLine,
  estimatedUnitPrice: { type: Number, optional: true, min: 0 },
});

export const QuoteLine = new SimpleSchema({
  ...baseLine,
  unitPrice: { type: Number, min: 0 },
});

export const OrderLine = new SimpleSchema({
  ...baseLine,
  unitPrice: { type: Number, min: 0 },
  // Percent, e.g. 18 for 18%.
  taxRate: { type: Number, min: 0 },
  receivedQuantity: { type: Number, min: 0 },
  invoicedQuantity: { type: Number, min: 0 },
});

export const InvoiceLine = new SimpleSchema({
  ...baseLine,
  orderLineId: { type: String, optional: true },
  unitPrice: { type: Number, min: 0 },
  taxRate: { type: Number, min: 0 },
});

export const ReceiptLine = new SimpleSchema({
  _id: { type: String },
  orderLineId: { type: String },
  // Snapshot of the ordered line, for display.
  description: { type: String },
  unit: { type: String },
  receivedQuantity: { type: Number, min: 0 },
  rejectedQuantity: { type: Number, min: 0 },
  remarks: { type: String, optional: true },
});

export const PaymentAllocation = new SimpleSchema({
  invoiceId: { type: String },
  amount: { type: Number, min: 0 },
});
