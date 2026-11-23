import gql from 'graphql-tag';

export default gql`
type PurchasingPaymentAllocation {
  invoiceId: String
  invoice: PurchasingInvoice
  amount: Float
}

input PurchasingPaymentAllocationInput {
  invoiceId: String!
  amount: Float!
}

type PurchasingPayment {
  _id: String
  number: String
  vendorId: String
  vendor: PurchasingVendor
  paymentDate: String
  method: String
  reference: String
  notes: String
  amount: Float
  allocations: [PurchasingPaymentAllocation]
  status: String
  voidedAt: String
  voidedBy: String
  voidReason: String

  createdAt: String
  createdBy: String
  updatedAt: String
  updatedBy: String
}

type PagedPurchasingPayments {
  totalResults: Int
  data: [PurchasingPayment]
}

extend type Query {
  purchasingPaymentById(_id: String!): PurchasingPayment
    @checkPermissions(permissions: [PURCHASING_VIEW_PAYMENTS, PURCHASING_MANAGE_PAYMENTS])

  pagedPurchasingPayments(
    search: String
    status: String
    vendorId: String
    fromDate: String
    toDate: String
    pageIndex: Int
    pageSize: Int
  ): PagedPurchasingPayments
    @checkPermissions(permissions: [PURCHASING_VIEW_PAYMENTS, PURCHASING_MANAGE_PAYMENTS])
}

extend type Mutation {
  postPurchasingPayment(
    vendorId: String!
    paymentDate: String!
    method: String!
    reference: String
    notes: String
    allocations: [PurchasingPaymentAllocationInput!]!
  ): PurchasingPayment
    @checkPermissions(permissions: [PURCHASING_MANAGE_PAYMENTS])

  voidPurchasingPayment(_id: String!, reason: String!): PurchasingPayment
    @checkPermissions(permissions: [PURCHASING_MANAGE_PAYMENTS])
}
`;
