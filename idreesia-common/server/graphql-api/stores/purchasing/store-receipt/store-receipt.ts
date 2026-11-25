import gql from 'graphql-tag';

// A store receiving the goods that arrive from vendors against its orders.
// Posting a receipt raises the stock levels of the store's items.
export default gql`
type StoreReceiptLine {
  _id: String
  orderLineId: String
  externalCatalogId: String
  description: String
  unit: String
  receivedQuantity: Float
  rejectedQuantity: Float
  remarks: String
}

type StoreReceipt {
  _id: String
  number: String
  orderId: String
  orderNumber: String
  receivedDate: String
  receivedBy: String
  receivedByPerson: PersonBasicType
  deliveryNoteNo: String
  notes: String
  lines: [StoreReceiptLine]
  status: String
  voidedAt: String
  voidReason: String
  createdAt: String
}

type PagedStoreReceipts {
  totalResults: Int
  data: [StoreReceipt]
}

extend type Query {
  storeReceiptById(physicalStoreId: String!, _id: String!): StoreReceipt
    @checkStoreAccess(permissions: [IN_VIEW_RECEIPTS, IN_MANAGE_RECEIPTS], physicalStoreIdArgName: "physicalStoreId", returnType: "object")

  pagedStoreReceipts(
    physicalStoreId: String!
    search: String
    status: String
    orderId: String
    pageIndex: Int
    pageSize: Int
  ): PagedStoreReceipts
    @checkStoreAccess(permissions: [IN_VIEW_RECEIPTS, IN_MANAGE_RECEIPTS], physicalStoreIdArgName: "physicalStoreId", returnType: "paged-list")
}

extend type Mutation {
  # received is what is accepted into the store (it adds to the stock levels);
  # rejected is only recorded.
  postStoreReceipt(
    physicalStoreId: String!
    orderId: String!
    receivedDate: String!
    receivedBy: String
    deliveryNoteNo: String
    notes: String
    lines: [PurchasingReceiptLineInput!]!
  ): StoreReceipt
    @checkStoreAccess(permissions: [IN_MANAGE_RECEIPTS], physicalStoreIdArgName: "physicalStoreId")

  # Refused when the goods were already issued from the store.
  voidStoreReceipt(physicalStoreId: String!, _id: String!, reason: String!): StoreReceipt
    @checkStoreAccess(permissions: [IN_MANAGE_RECEIPTS], physicalStoreIdArgName: "physicalStoreId")
}
`;
