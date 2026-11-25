import gql from 'graphql-tag';

// What a store sees of the purchase orders raised from its requisitions: what
// is on its way, never the prices.
export default gql`
type StoreOrderLine {
  _id: String
  # The store's stock item.
  externalCatalogId: String
  description: String
  unit: String
  quantity: Float
  receivedQuantity: Float
}

type StoreOrder {
  _id: String
  number: String
  requisitionId: String
  requisitionNumber: String
  vendorName: String
  orderDate: String
  expectedDeliveryDate: String
  status: String
  lines: [StoreOrderLine]
}

type PagedStoreOrders {
  totalResults: Int
  data: [StoreOrder]
}

extend type Query {
  storeOrderById(physicalStoreId: String!, _id: String!): StoreOrder
    @checkStoreAccess(permissions: [IN_VIEW_RECEIPTS, IN_MANAGE_RECEIPTS, IN_VIEW_REQUISITIONS, IN_MANAGE_REQUISITIONS], physicalStoreIdArgName: "physicalStoreId", returnType: "object")

  # statuses limits the orders to those states (e.g. the ones goods can still
  # be received in). Orders that are still drafts or awaiting approval are
  # never listed.
  pagedStoreOrders(
    physicalStoreId: String!
    search: String
    requisitionId: String
    statuses: [String]
    pageIndex: Int
    pageSize: Int
  ): PagedStoreOrders
    @checkStoreAccess(permissions: [IN_VIEW_RECEIPTS, IN_MANAGE_RECEIPTS, IN_VIEW_REQUISITIONS, IN_MANAGE_REQUISITIONS], physicalStoreIdArgName: "physicalStoreId", returnType: "paged-list")
}
`;
