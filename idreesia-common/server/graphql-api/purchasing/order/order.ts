import gql from 'graphql-tag';

export default gql`
type PurchasingOrderLine {
  _id: String
  catalogItemId: String
  description: String
  unit: String
  quantity: Float
  unitPrice: Float
  taxRate: Float
  receivedQuantity: Float
  invoicedQuantity: Float
}

type PurchasingOrder {
  _id: String
  number: String
  vendorId: String
  vendor: PurchasingVendor
  requisitionId: String
  quoteId: String
  orderDate: String
  expectedDeliveryDate: String
  deliveryAddress: String
  paymentTermsDays: Int
  notes: String
  lines: [PurchasingOrderLine]
  subtotal: Float
  taxTotal: Float
  discount: Float
  shipping: Float
  total: Float
  status: String
  version: Int
  submittedAt: String
  submittedBy: String
  approvedAt: String
  approvedBy: String
  rejectionReason: String
  sentAt: String
  sentBy: String
  closedAt: String
  closedBy: String
  cancelledAt: String
  cancelledBy: String

  createdAt: String
  createdBy: String
  updatedAt: String
  updatedBy: String
}

type PagedPurchasingOrders {
  totalResults: Int
  data: [PurchasingOrder]
}

extend type Query {
  purchasingOrderById(_id: String!): PurchasingOrder
    @checkPermissions(permissions: [PURCHASING_VIEW_ORDERS, PURCHASING_MANAGE_ORDERS, PURCHASING_APPROVE_ORDERS, PURCHASING_VIEW_RECEIPTS, PURCHASING_MANAGE_RECEIPTS, PURCHASING_VIEW_INVOICES, PURCHASING_MANAGE_INVOICES])

  pagedPurchasingOrders(
    search: String
    status: String
    # Any of these statuses; ignored when status is given.
    statuses: [String]
    vendorId: String
    requisitionId: String
    fromDate: String
    toDate: String
    pageIndex: Int
    pageSize: Int
  ): PagedPurchasingOrders
    @checkPermissions(permissions: [PURCHASING_VIEW_ORDERS, PURCHASING_MANAGE_ORDERS, PURCHASING_APPROVE_ORDERS, PURCHASING_VIEW_RECEIPTS, PURCHASING_MANAGE_RECEIPTS, PURCHASING_VIEW_INVOICES, PURCHASING_MANAGE_INVOICES])
}

extend type Mutation {
  createPurchasingOrder(
    vendorId: String!
    orderDate: String!
    expectedDeliveryDate: String
    deliveryAddress: String
    paymentTermsDays: Int
    notes: String
    discount: Float
    shipping: Float
    lines: [PurchasingPricedLineInput!]!
  ): PurchasingOrder
    @checkPermissions(permissions: [PURCHASING_MANAGE_ORDERS])

  # Only a draft can be edited. version is the version that was loaded.
  updatePurchasingOrder(
    _id: String!
    version: Int!
    vendorId: String!
    orderDate: String!
    expectedDeliveryDate: String
    deliveryAddress: String
    paymentTermsDays: Int
    notes: String
    discount: Float
    shipping: Float
    lines: [PurchasingPricedLineInput!]!
  ): PurchasingOrder
    @checkPermissions(permissions: [PURCHASING_MANAGE_ORDERS])

  createPurchasingOrderFromRequisition(requisitionId: String!, vendorId: String!): PurchasingOrder
    @checkPermissions(permissions: [PURCHASING_MANAGE_ORDERS])

  createPurchasingOrderFromQuote(quoteId: String!): PurchasingOrder
    @checkPermissions(permissions: [PURCHASING_MANAGE_ORDERS])

  submitPurchasingOrder(_id: String!): PurchasingOrder
    @checkPermissions(permissions: [PURCHASING_MANAGE_ORDERS])

  markPurchasingOrderSent(_id: String!): PurchasingOrder
    @checkPermissions(permissions: [PURCHASING_MANAGE_ORDERS])

  closePurchasingOrder(_id: String!): PurchasingOrder
    @checkPermissions(permissions: [PURCHASING_MANAGE_ORDERS])

  cancelPurchasingOrder(_id: String!): PurchasingOrder
    @checkPermissions(permissions: [PURCHASING_MANAGE_ORDERS])

  deletePurchasingOrder(_id: String!): Boolean
    @checkPermissions(permissions: [PURCHASING_MANAGE_ORDERS])

  approvePurchasingOrder(_id: String!): PurchasingOrder
    @checkPermissions(permissions: [PURCHASING_APPROVE_ORDERS])

  # Sends a submitted order back to a draft.
  rejectPurchasingOrder(_id: String!, reason: String!): PurchasingOrder
    @checkPermissions(permissions: [PURCHASING_APPROVE_ORDERS])
}
`;
