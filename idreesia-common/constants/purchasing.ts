/**
 * Constants for the Purchasing module (server/business-logic/purchasing).
 */

/** Longest allowed vendor / catalog item name. */
export const MAX_NAME_LENGTH = 255;

/** Document kinds that get a human-readable number (e.g. PO-2026-0001). */
export const NumberedDocument = {
  REQUISITION: 'PR',
  ORDER: 'PO',
  RECEIPT: 'GRN',
  INVOICE: 'INV',
  PAYMENT: 'PAY',
} as const;
export type NumberedDocumentValue =
  (typeof NumberedDocument)[keyof typeof NumberedDocument];

export const RequisitionStatus = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  // An approved requisition that a purchase order was made from.
  ORDERED: 'ordered',
  CANCELLED: 'cancelled',
} as const;
export type RequisitionStatusValue =
  (typeof RequisitionStatus)[keyof typeof RequisitionStatus];

export const QuoteStatus = {
  RECEIVED: 'received',
  SELECTED: 'selected',
  REJECTED: 'rejected',
} as const;
export type QuoteStatusValue = (typeof QuoteStatus)[keyof typeof QuoteStatus];

export const OrderStatus = {
  DRAFT: 'draft',
  PENDING_APPROVAL: 'pending-approval',
  APPROVED: 'approved',
  SENT: 'sent',
  PARTIALLY_RECEIVED: 'partially-received',
  RECEIVED: 'received',
  CLOSED: 'closed',
  CANCELLED: 'cancelled',
} as const;
export type OrderStatusValue = (typeof OrderStatus)[keyof typeof OrderStatus];

/** Order states in which goods can be received. */
export const ReceivableOrderStatuses: OrderStatusValue[] = [
  OrderStatus.APPROVED,
  OrderStatus.SENT,
  OrderStatus.PARTIALLY_RECEIVED,
];

/** Order states that can be invoiced. */
export const InvoiceableOrderStatuses: OrderStatusValue[] = [
  OrderStatus.APPROVED,
  OrderStatus.SENT,
  OrderStatus.PARTIALLY_RECEIVED,
  OrderStatus.RECEIVED,
];

export const ReceiptStatus = {
  POSTED: 'posted',
  VOIDED: 'voided',
} as const;
export type ReceiptStatusValue =
  (typeof ReceiptStatus)[keyof typeof ReceiptStatus];

export const InvoiceStatus = {
  UNPAID: 'unpaid',
  PARTIALLY_PAID: 'partially-paid',
  PAID: 'paid',
  VOIDED: 'voided',
} as const;
export type InvoiceStatusValue =
  (typeof InvoiceStatus)[keyof typeof InvoiceStatus];

export const PaymentStatus = {
  POSTED: 'posted',
  VOIDED: 'voided',
} as const;
export type PaymentStatusValue =
  (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const PaymentMethod = {
  CASH: 'cash',
  BANK_TRANSFER: 'bank-transfer',
  CHEQUE: 'cheque',
} as const;
export type PaymentMethodValue =
  (typeof PaymentMethod)[keyof typeof PaymentMethod];

/** Most lines a single document can have. */
export const MAX_LINES = 200;

/** What a file can be attached to. */
export const AttachmentOwnerType = {
  REQUISITION: 'requisition',
  QUOTE: 'quote',
  ORDER: 'order',
  RECEIPT: 'receipt',
  INVOICE: 'invoice',
  PAYMENT: 'payment',
} as const;
export type AttachmentOwnerTypeValue =
  (typeof AttachmentOwnerType)[keyof typeof AttachmentOwnerType];

export const AttachmentStatus = {
  // The upload URL was handed out; the file may not be stored yet.
  PENDING: 'pending',
  READY: 'ready',
} as const;
export type AttachmentStatusValue =
  (typeof AttachmentStatus)[keyof typeof AttachmentStatus];

export const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;
export const ALLOWED_ATTACHMENT_TYPES = [
  'application/pdf',
  'image/*',
  'text/plain',
  'text/csv',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];
export const ATTACHMENT_UPLOAD_URL_EXPIRY_SECONDS = 15 * 60;
export const ATTACHMENT_DOWNLOAD_URL_EXPIRY_SECONDS = 5 * 60;
