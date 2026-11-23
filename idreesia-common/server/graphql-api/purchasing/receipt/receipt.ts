import gql from 'graphql-tag';

export default gql`
type PurchasingReceiptLine {
  _id: String
  orderLineId: String
  description: String
  unit: String
  receivedQuantity: Float
  rejectedQuantity: Float
  remarks: String
}

input PurchasingReceiptLineInput {
  orderLineId: String!
  receivedQuantity: Float!
  rejectedQuantity: Float
  remarks: String
}

type PurchasingReceipt {
  _id: String
  number: String
  orderId: String
  order: PurchasingOrder
  vendorId: String
  vendor: PurchasingVendor
  receivedDate: String
  receivedBy: String
  receivedByPerson: PersonBasicType
  deliveryNoteNo: String
  notes: String
  lines: [PurchasingReceiptLine]
  status: String
  voidedAt: String
  voidedBy: String
  voidReason: String

  createdAt: String
  createdBy: String
  updatedAt: String
  updatedBy: String
}

type PagedPurchasingReceipts {
  totalResults: Int
  data: [PurchasingReceipt]
}

extend type Query {
  purchasingReceiptById(_id: String!): PurchasingReceipt
    @checkPermissions(permissions: [PURCHASING_VIEW_RECEIPTS, PURCHASING_MANAGE_RECEIPTS])

  pagedPurchasingReceipts(
    search: String
    status: String
    vendorId: String
    orderId: String
    pageIndex: Int
    pageSize: Int
  ): PagedPurchasingReceipts
    @checkPermissions(permissions: [PURCHASING_VIEW_RECEIPTS, PURCHASING_MANAGE_RECEIPTS, PURCHASING_VIEW_ORDERS, PURCHASING_MANAGE_ORDERS])
}

extend type Mutation {
  postPurchasingReceipt(
    orderId: String!
    receivedDate: String!
    receivedBy: String
    deliveryNoteNo: String
    notes: String
    lines: [PurchasingReceiptLineInput!]!
  ): PurchasingReceipt
    @checkPermissions(permissions: [PURCHASING_MANAGE_RECEIPTS])

  voidPurchasingReceipt(_id: String!, reason: String!): PurchasingReceipt
    @checkPermissions(permissions: [PURCHASING_MANAGE_RECEIPTS])
}
`;
