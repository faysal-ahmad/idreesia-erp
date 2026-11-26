import type {
  AttachmentOwnerTypeValue,
  AttachmentStatusValue,
  InvoiceStatusValue,
  OrderStatusValue,
  PaymentMethodValue,
  PaymentStatusValue,
  PettyCashReplenishmentStatusValue,
  PettyCashVoucherStatusValue,
  QuoteStatusValue,
  ReceiptStatusValue,
  RequisitionSourceValue,
  RequisitionStatusValue,
} from 'meteor/idreesia-common/constants/purchasing';

interface Timestamps {
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
}

export interface PurchasingVendorDocument extends Timestamps {
  _id: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxId?: string;
  paymentTermsDays?: number;
  bankName?: string;
  bankAccountTitle?: string;
  bankAccountNumber?: string;
  notes?: string;
  isActive: boolean;
}

export interface PurchasingCatalogItemDocument extends Timestamps {
  _id: string;
  name: string;
  unit: string;
  category?: string;
  company?: string;
  imageKey?: string;
  description?: string;
  defaultUnitPrice?: number;
  lastUnitPrice?: number;
  lastVendorId?: string;
  isActive: boolean;
}

export interface PurchasingCounterDocument {
  _id: string;
  type: string;
  year: number;
  seq: number;
}

export interface RequisitionLine {
  _id: string;
  internalCatalogId?: string;
  externalCatalogId?: string;
  description: string;
  unit: string;
  quantity: number;
  estimatedUnitPrice?: number;
}

export interface PurchasingRequisitionDocument extends Timestamps {
  _id: string;
  number: string;
  title: string;
  purpose?: string;
  requestedBy?: string;
  /** Free text: who or what the goods are for. */
  requestedFor?: string;
  neededBy?: Date;
  /** Only set for store-raised documents; absent means purchasing. */
  source?: RequisitionSourceValue;
  /** The physical store id when `source` is 'store'. */
  externalSourceId?: string;
  lines: RequisitionLine[];
  estimatedTotal: number;
  status: RequisitionStatusValue;
  version: number;
  submittedAt?: Date;
  submittedBy?: string;
  approvedAt?: Date;
  approvedBy?: string;
  rejectedAt?: Date;
  rejectedBy?: string;
  rejectionReason?: string;
  cancelledAt?: Date;
  cancelledBy?: string;
}

export interface QuoteLine {
  _id: string;
  /** The requisition line this prices. Missing on legacy quotes. */
  requisitionLineId?: string;
  internalCatalogId?: string;
  externalCatalogId?: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
}

export interface PurchasingQuoteDocument extends Timestamps {
  _id: string;
  requisitionId?: string;
  vendorId: string;
  reference?: string;
  quoteDate: Date;
  validUntil?: Date;
  lines: QuoteLine[];
  total: number;
  status: QuoteStatusValue;
  notes?: string;
  version: number;
}

export interface OrderLine {
  _id: string;
  /** The requisition line this was copied from. Missing on legacy orders. */
  requisitionLineId?: string;
  internalCatalogId?: string;
  externalCatalogId?: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  receivedQuantity: number;
  invoicedQuantity: number;
}

export interface PurchasingOrderDocument extends Timestamps {
  _id: string;
  number: string;
  vendorId: string;
  requisitionId?: string;
  quoteId?: string;
  /** Only set for store-raised documents; absent means purchasing. */
  source?: RequisitionSourceValue;
  /** The physical store id when `source` is 'store'. */
  externalSourceId?: string;
  orderDate: Date;
  expectedDeliveryDate?: Date;
  deliveryAddress?: string;
  paymentTermsDays?: number;
  notes?: string;
  lines: OrderLine[];
  subtotal: number;
  taxTotal: number;
  discount: number;
  shipping: number;
  total: number;
  status: OrderStatusValue;
  version: number;
  submittedAt?: Date;
  submittedBy?: string;
  approvedAt?: Date;
  approvedBy?: string;
  rejectionReason?: string;
  sentAt?: Date;
  sentBy?: string;
  closedAt?: Date;
  closedBy?: string;
  cancelledAt?: Date;
  cancelledBy?: string;
}

export interface ReceiptLine {
  _id: string;
  orderLineId: string;
  /** The store stock item this adds to, copied from the order line. */
  externalCatalogId?: string;
  description: string;
  unit: string;
  receivedQuantity: number;
  rejectedQuantity: number;
  remarks?: string;
}

export interface PurchasingReceiptDocument extends Timestamps {
  _id: string;
  number: string;
  orderId: string;
  vendorId: string;
  /** Only set for store-raised documents; absent means purchasing. */
  source?: RequisitionSourceValue;
  /** The physical store id when `source` is 'store'. */
  externalSourceId?: string;
  receivedDate: Date;
  receivedBy?: string;
  deliveryNoteNo?: string;
  notes?: string;
  lines: ReceiptLine[];
  status: ReceiptStatusValue;
  voidedAt?: Date;
  voidedBy?: string;
  voidReason?: string;
}

export interface InvoiceLine {
  _id: string;
  internalCatalogId?: string;
  externalCatalogId?: string;
  /** Missing on legacy invoices. */
  orderId?: string;
  orderLineId?: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

export interface PurchasingInvoiceDocument extends Timestamps {
  _id: string;
  number: string;
  vendorInvoiceNo: string;
  vendorId: string;
  /** Legacy: set on invoices made before lines were billed per order. */
  orderId?: string;
  /** Every order the lines are billed against. */
  orderIds?: string[];
  invoiceDate: Date;
  dueDate: Date;
  notes?: string;
  lines: InvoiceLine[];
  subtotal: number;
  taxTotal: number;
  total: number;
  paidAmount: number;
  status: InvoiceStatusValue;
  isDisputed: boolean;
  voidedAt?: Date;
  voidedBy?: string;
}

export interface PaymentAllocation {
  invoiceId: string;
  amount: number;
}

export interface PurchasingPaymentDocument extends Timestamps {
  _id: string;
  number: string;
  vendorId: string;
  paymentDate: Date;
  method: PaymentMethodValue;
  reference?: string;
  notes?: string;
  amount: number;
  allocations: PaymentAllocation[];
  status: PaymentStatusValue;
  voidedAt?: Date;
  voidedBy?: string;
  voidReason?: string;
}

export interface PurchasingAttachmentDocument extends Timestamps {
  _id: string;
  ownerType: AttachmentOwnerTypeValue;
  ownerId: string;
  name: string;
  fileName: string;
  mimeType: string;
  size: number;
  fileKey: string;
  status: AttachmentStatusValue;
  uploadExpiresAt?: Date;
}

export interface PurchasingPettyCashExpenseHeadDocument extends Timestamps {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  version: number;
}

export interface PurchasingPettyCashFundDocument extends Timestamps {
  _id: string;
  name: string;
  custodianPersonId: string;
  floatAmount: number;
  perTransactionLimit?: number;
  balance: number;
  isActive: boolean;
  notes?: string;
  version: number;
}

export interface PettyCashVoucherLine {
  _id: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  /** Set when the item goes into a store's stock. */
  physicalStoreId?: string;
  externalCatalogId?: string;
}

export interface PurchasingPettyCashVoucherDocument extends Timestamps {
  _id: string;
  number: string;
  fundId: string;
  expenseHeadId: string;
  voucherDate: Date;
  payee?: string;
  vendorId?: string;
  purpose?: string;
  lines: PettyCashVoucherLine[];
  total: number;
  status: PettyCashVoucherStatusValue;
  version: number;
  submittedAt?: Date;
  submittedBy?: string;
  approvedAt?: Date;
  approvedBy?: string;
  rejectedAt?: Date;
  rejectedBy?: string;
  rejectionReason?: string;
  voidedAt?: Date;
  voidedBy?: string;
  voidReason?: string;
  replenishmentId?: string;
}

export interface PurchasingPettyCashReplenishmentDocument extends Timestamps {
  _id: string;
  number: string;
  fundId: string;
  voucherIds: string[];
  amount: number;
  countedCash?: number;
  variance?: number;
  notes?: string;
  status: PettyCashReplenishmentStatusValue;
  version: number;
  approvedAt?: Date;
  approvedBy?: string;
  rejectedAt?: Date;
  rejectedBy?: string;
  rejectionReason?: string;
}
