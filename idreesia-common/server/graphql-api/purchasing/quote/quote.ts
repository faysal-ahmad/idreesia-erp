import gql from 'graphql-tag';

export default gql`
# A line of a quote, order or invoice that has a price.
input PurchasingPricedLineInput {
  _id: String
  internalCatalogId: String
  description: String
  unit: String
  quantity: Float!
  unitPrice: Float!
  taxRate: Float
  # Quotes only: the requisition line being priced.
  requisitionLineId: String
  # Invoices only: the order (and its line) being billed.
  orderId: String
  orderLineId: String
}

type PurchasingQuoteLine {
  _id: String
  requisitionLineId: String
  internalCatalogId: String
  externalCatalogId: String
  description: String
  unit: String
  quantity: Float
  unitPrice: Float
}

type PurchasingQuote {
  _id: String
  requisitionId: String
  vendorId: String
  vendor: PurchasingVendor
  reference: String
  quoteDate: String
  validUntil: String
  lines: [PurchasingQuoteLine]
  total: Float
  status: String
  notes: String
  version: Int

  createdAt: String
  createdBy: String
  updatedAt: String
  updatedBy: String
}

type PagedPurchasingQuotes {
  totalResults: Int
  data: [PurchasingQuote]
}

extend type Query {
  purchasingQuoteById(_id: String!): PurchasingQuote
    @checkPermissions(permissions: [PURCHASING_VIEW_ORDERS, PURCHASING_MANAGE_ORDERS, PURCHASING_APPROVE_ORDERS])

  pagedPurchasingQuotes(
    search: String
    status: String
    vendorId: String
    requisitionId: String
    pageIndex: Int
    pageSize: Int
  ): PagedPurchasingQuotes
    @checkPermissions(permissions: [PURCHASING_VIEW_ORDERS, PURCHASING_MANAGE_ORDERS, PURCHASING_APPROVE_ORDERS])
}

extend type Mutation {
  createPurchasingQuote(
    requisitionId: String!
    vendorId: String!
    reference: String
    quoteDate: String!
    validUntil: String
    notes: String
    lines: [PurchasingPricedLineInput!]!
  ): PurchasingQuote
    @checkPermissions(permissions: [PURCHASING_MANAGE_ORDERS])

  updatePurchasingQuote(
    _id: String!
    version: Int!
    requisitionId: String!
    vendorId: String!
    reference: String
    quoteDate: String!
    validUntil: String
    notes: String
    lines: [PurchasingPricedLineInput!]!
  ): PurchasingQuote
    @checkPermissions(permissions: [PURCHASING_MANAGE_ORDERS])

  selectPurchasingQuote(_id: String!): PurchasingQuote
    @checkPermissions(permissions: [PURCHASING_MANAGE_ORDERS])

  rejectPurchasingQuote(_id: String!): PurchasingQuote
    @checkPermissions(permissions: [PURCHASING_MANAGE_ORDERS])

  deletePurchasingQuote(_id: String!): Boolean
    @checkPermissions(permissions: [PURCHASING_MANAGE_ORDERS])
}
`;
