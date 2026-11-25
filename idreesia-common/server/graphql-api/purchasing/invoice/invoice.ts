import gql from 'graphql-tag';

export default gql`
type PurchasingInvoiceLine {
  _id: String
  internalCatalogId: String
  externalCatalogId: String
  orderId: String
  orderLineId: String
  description: String
  unit: String
  quantity: Float
  unitPrice: Float
  taxRate: Float
}

type PurchasingInvoice {
  _id: String
  number: String
  vendorInvoiceNo: String
  vendorId: String
  vendor: PurchasingVendor
  # Legacy invoices were for a single order.
  orderId: String
  # Every order the lines are billed against.
  orderIds: [String]
  orders: [PurchasingOrder]
  invoiceDate: String
  dueDate: String
  notes: String
  lines: [PurchasingInvoiceLine]
  subtotal: Float
  taxTotal: Float
  total: Float
  paidAmount: Float
  # What is still owed: total minus what was paid.
  balance: Float
  status: String
  isDisputed: Boolean
  voidedAt: String
  voidedBy: String

  createdAt: String
  createdBy: String
  updatedAt: String
  updatedBy: String
}

type PagedPurchasingInvoices {
  totalResults: Int
  data: [PurchasingInvoice]
}

extend type Query {
  purchasingInvoiceById(_id: String!): PurchasingInvoice
    @checkPermissions(permissions: [PURCHASING_VIEW_INVOICES, PURCHASING_MANAGE_INVOICES, PURCHASING_VIEW_PAYMENTS, PURCHASING_MANAGE_PAYMENTS])

  pagedPurchasingInvoices(
    search: String
    status: String
    vendorId: String
    orderId: String
    isDisputed: Boolean
    overdue: Boolean
    fromDate: String
    toDate: String
    pageIndex: Int
    pageSize: Int
  ): PagedPurchasingInvoices
    @checkPermissions(permissions: [PURCHASING_VIEW_INVOICES, PURCHASING_MANAGE_INVOICES, PURCHASING_VIEW_PAYMENTS, PURCHASING_MANAGE_PAYMENTS, PURCHASING_VIEW_ORDERS, PURCHASING_MANAGE_ORDERS])
}

extend type Mutation {
  # Billing for more than was received fails unless allowOverBilling is set;
  # the invoice is then marked disputed.
  createPurchasingInvoice(
    vendorId: String!
    vendorInvoiceNo: String!
    invoiceDate: String!
    dueDate: String
    notes: String
    allowOverBilling: Boolean
    lines: [PurchasingPricedLineInput!]!
  ): PurchasingInvoice
    @checkPermissions(permissions: [PURCHASING_MANAGE_INVOICES])

  updatePurchasingInvoice(
    _id: String!
    vendorInvoiceNo: String!
    dueDate: String!
    notes: String
  ): PurchasingInvoice
    @checkPermissions(permissions: [PURCHASING_MANAGE_INVOICES])

  setPurchasingInvoiceDisputed(_id: String!, isDisputed: Boolean!): PurchasingInvoice
    @checkPermissions(permissions: [PURCHASING_MANAGE_INVOICES])

  voidPurchasingInvoice(_id: String!): PurchasingInvoice
    @checkPermissions(permissions: [PURCHASING_MANAGE_INVOICES])
}
`;
