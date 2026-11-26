/**
 * Constants for the Purchasing module (server/business-logic/purchasing).
 */

import Permissions from './permissions';

/** Longest allowed vendor / catalog item name. */
export const MAX_NAME_LENGTH = 255;

/** Document kinds that get a human-readable number (e.g. PO-2026-0001). */
export const NumberedDocument = {
  REQUISITION: 'PR',
  ORDER: 'PO',
  RECEIPT: 'GRN',
  INVOICE: 'INV',
  PAYMENT: 'PAY',
  PETTY_CASH_VOUCHER: 'PCV',
  PETTY_CASH_REPLENISHMENT: 'PCR',
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
  // Every order made from the requisition has been received (or closed).
  CLOSED: 'closed',
  CANCELLED: 'cancelled',
} as const;
export type RequisitionStatusValue =
  (typeof RequisitionStatus)[keyof typeof RequisitionStatus];

/**
 * Who raised a requisition. Purchasing's own requisitions have no source
 * field at all, so only the store value is ever stored.
 */
export const RequisitionSource = {
  STORE: 'store',
} as const;
export type RequisitionSourceValue =
  (typeof RequisitionSource)[keyof typeof RequisitionSource];

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

/** Order states a store can see: from approved on, never a draft or one awaiting approval. */
export const StoreVisibleOrderStatuses: OrderStatusValue[] = [
  OrderStatus.APPROVED,
  OrderStatus.SENT,
  OrderStatus.PARTIALLY_RECEIVED,
  OrderStatus.RECEIVED,
  OrderStatus.CLOSED,
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

export const PettyCashVoucherStatus = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  VOIDED: 'voided',
} as const;
export type PettyCashVoucherStatusValue =
  (typeof PettyCashVoucherStatus)[keyof typeof PettyCashVoucherStatus];

export const PettyCashReplenishmentStatus = {
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;
export type PettyCashReplenishmentStatusValue =
  (typeof PettyCashReplenishmentStatus)[keyof typeof PettyCashReplenishmentStatus];

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
  PETTY_CASH_VOUCHER: 'petty-cash-voucher',
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

// ---------------------------------------------------------------------------
// The permissions of the module, grouped as the Permissions page shows them.
// ---------------------------------------------------------------------------

export interface PurchasingPermissionInfo {
  /** The permission string, e.g. "purchasing-view-vendors". */
  key: string;
  name: string;
  description: string;
}

export interface PurchasingPermissionGroup {
  featureKey: string;
  featureName: string;
  permissions: PurchasingPermissionInfo[];
}

export const PurchasingPermissionCatalog: PurchasingPermissionGroup[] = [
  {
    featureKey: 'setup',
    featureName: 'Setup',
    permissions: [
      { key: Permissions.PURCHASING_VIEW_VENDORS, name: 'View Vendors', description: 'See the vendor list' },
      { key: Permissions.PURCHASING_MANAGE_VENDORS, name: 'Manage Vendors', description: 'Add, edit and deactivate vendors' },
      { key: Permissions.PURCHASING_MANAGE_CATALOG, name: 'Manage Catalog', description: 'Add, edit and deactivate catalog items' },
    ],
  },
  {
    featureKey: 'requisitions',
    featureName: 'Requisitions',
    permissions: [
      { key: Permissions.PURCHASING_VIEW_REQUISITIONS, name: 'View Requisitions', description: 'See requisitions' },
      { key: Permissions.PURCHASING_MANAGE_REQUISITIONS, name: 'Manage Requisitions', description: 'Create, edit, submit and cancel requisitions' },
      { key: Permissions.PURCHASING_APPROVE_REQUISITIONS, name: 'Approve Requisitions', description: 'Approve and reject requisitions' },
    ],
  },
  {
    featureKey: 'orders',
    featureName: 'Purchase Orders',
    permissions: [
      { key: Permissions.PURCHASING_VIEW_ORDERS, name: 'View Orders', description: 'See purchase orders and quotes' },
      { key: Permissions.PURCHASING_MANAGE_ORDERS, name: 'Manage Orders and Quotes', description: 'Create and edit orders and quotes, send, cancel and close orders' },
      { key: Permissions.PURCHASING_APPROVE_ORDERS, name: 'Approve Orders', description: 'Approve orders and return them to draft' },
    ],
  },
  {
    featureKey: 'receipts',
    featureName: 'Goods Receipts',
    permissions: [
      { key: Permissions.PURCHASING_VIEW_RECEIPTS, name: 'View Receipts', description: 'See goods receipts' },
      { key: Permissions.PURCHASING_MANAGE_RECEIPTS, name: 'Manage Receipts', description: 'Post and void goods receipts' },
    ],
  },
  {
    featureKey: 'finance',
    featureName: 'Invoices and Payments',
    permissions: [
      { key: Permissions.PURCHASING_VIEW_INVOICES, name: 'View Invoices', description: 'See vendor invoices' },
      { key: Permissions.PURCHASING_MANAGE_INVOICES, name: 'Manage Invoices', description: 'Enter, edit, dispute and void invoices' },
      { key: Permissions.PURCHASING_VIEW_PAYMENTS, name: 'View Payments', description: 'See payments' },
      { key: Permissions.PURCHASING_MANAGE_PAYMENTS, name: 'Manage Payments', description: 'Post and void payments' },
    ],
  },
  {
    featureKey: 'petty-cash',
    featureName: 'Petty Cash',
    permissions: [
      { key: Permissions.PURCHASING_VIEW_PETTY_CASH, name: 'View Petty Cash', description: 'See petty cash funds, vouchers and replenishments' },
      { key: Permissions.PURCHASING_MANAGE_PETTY_CASH_FUNDS, name: 'Manage Petty Cash Funds and Expense Heads', description: 'Create and edit funds and expense heads, and deactivate them' },
      { key: Permissions.PURCHASING_MANAGE_PETTY_CASH_VOUCHERS, name: 'Manage Petty Cash Vouchers', description: 'Create, edit and submit vouchers and request replenishments' },
      { key: Permissions.PURCHASING_APPROVE_PETTY_CASH_VOUCHERS, name: 'Approve Petty Cash Vouchers', description: 'Approve, reject and void vouchers' },
      { key: Permissions.PURCHASING_APPROVE_PETTY_CASH_REPLENISHMENTS, name: 'Approve Petty Cash Replenishments', description: 'Approve and reject replenishment requests' },
    ],
  },
  {
    featureKey: 'administration',
    featureName: 'Administration',
    permissions: [
      { key: Permissions.PURCHASING_VIEW_REPORTS, name: 'View Reports', description: 'Dashboard figures, reports and Excel downloads' },
      { key: Permissions.PURCHASING_VIEW_AUDIT_LOGS, name: 'View Audit Logs', description: 'The Audit Logs page and the History tab of documents' },
      { key: Permissions.PURCHASING_MANAGE_PERMISSIONS, name: 'Manage Purchasing Permissions', description: 'See who holds each Purchasing permission, and add or remove users' },
    ],
  },
];

/**
 * The city location whose karkuns can be given Purchasing permissions and put
 * in Purchasing user groups (matched by name, ignoring case).
 */
export const PURCHASING_KARKUN_CITY = 'Multan';
