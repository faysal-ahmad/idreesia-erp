import type {
  AttachmentOwnerTypeValue,
  AttachmentStatusValue,
  InvoiceStatusValue,
  OrderStatusValue,
  PaymentMethodValue,
  PaymentStatusValue,
  QuoteStatusValue,
  ReceiptStatusValue,
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
  catalogItemId?: string;
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
  neededBy?: Date;
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
  catalogItemId?: string;
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
  catalogItemId?: string;
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
  catalogItemId?: string;
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
  orderId?: string;
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
