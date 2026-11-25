import gql from 'graphql-tag';

export default gql`
type StockAdjustment {
  _id: String
  physicalStoreId: String
  stockItemId: String
  adjustmentDate: String
  adjustedBy: String
  quantity: Float
  isInflow: Boolean
  adjustmentReason: String

  refStockItem: StockItem
  refAdjustedBy: PersonType
  refPhysicalStore: PhysicalStore

  createdAt: String
  createdBy: String
  updatedAt: String
  updatedBy: String
  approvedOn: String
  approvedBy: String
}

type PagedStockAdjustment {
  totalResults: Int
  data: [StockAdjustment]
}

extend type Query {
  stockAdjustmentById(_id: String!, physicalStoreId: String!): StockAdjustment
  @checkStoreAccess(permissions: [IN_VIEW_STOCK_ADJUSTMENTS, IN_MANAGE_STOCK_ADJUSTMENTS, IN_APPROVE_STOCK_ADJUSTMENTS], physicalStoreIdArgName: "physicalStoreId", returnType: "object")

  stockAdjustmentsByStockItem(
    physicalStoreId: String!
    stockItemId: String!
  ): [StockAdjustment]
  @checkStoreAccess(permissions: [IN_VIEW_STOCK_ADJUSTMENTS, IN_MANAGE_STOCK_ADJUSTMENTS, IN_APPROVE_STOCK_ADJUSTMENTS], physicalStoreIdArgName: "physicalStoreId", returnType: "list")

  pagedStockAdjustments(
    physicalStoreId: String!
    queryString: String
  ): PagedStockAdjustment
  @checkStoreAccess(permissions: [IN_VIEW_STOCK_ADJUSTMENTS, IN_MANAGE_STOCK_ADJUSTMENTS, IN_APPROVE_STOCK_ADJUSTMENTS], physicalStoreIdArgName: "physicalStoreId", returnType: "paged-list")
}

extend type Mutation {
  createStockAdjustment(
    physicalStoreId: String!
    stockItemId: String!
    adjustmentDate: String!
    adjustedBy: String!
    quantity: Float!
    isInflow: Boolean!
    adjustmentReason: String
  ): StockAdjustment
  @checkStoreAccess(permissions: [IN_MANAGE_STOCK_ADJUSTMENTS], physicalStoreIdArgName: "physicalStoreId")

  updateStockAdjustment(
    _id: String!
    physicalStoreId: String!
    adjustmentDate: String!
    adjustedBy: String!
    quantity: Float!
    isInflow: Boolean!
    adjustmentReason: String
  ): StockAdjustment
  @checkStoreAccess(permissions: [IN_MANAGE_STOCK_ADJUSTMENTS], physicalStoreIdArgName: "physicalStoreId")

  approveStockAdjustments(physicalStoreId: String!, _ids: [String]!): [StockAdjustment]
  @checkStoreAccess(permissions: [IN_APPROVE_STOCK_ADJUSTMENTS], physicalStoreIdArgName: "physicalStoreId")

  removeStockAdjustments(physicalStoreId: String!, _ids: [String]!): Int
  @checkStoreAccess(permissions: [IN_MANAGE_STOCK_ADJUSTMENTS], physicalStoreIdArgName: "physicalStoreId")
}
`;
