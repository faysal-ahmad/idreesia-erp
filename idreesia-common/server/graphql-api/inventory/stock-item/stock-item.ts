import gql from 'graphql-tag';

export default gql`
type StockItem {
  _id: String
  name: String
  company: String
  details: String
  unitOfMeasurement: String
  categoryId: String
  imageUrl: String
  physicalStoreId: String
  startingStockLevel: Float
  minStockLevel: Float
  currentStockLevel: Float
  totalStockLevel: Float
  verifiedOn: String

  formattedName: String
  categoryName: String
  purchaseFormsCount: Float
  issuanceFormsCount: Float
  stockAdjustmentsCount: Float

  refPhysicalStore: PhysicalStore

  createdAt: String
  createdBy: String
  updatedAt: String
  updatedBy: String
}

type PagedStockItem {
  totalResults: Int
  data: [StockItem]
}

extend type Query {
  pagedStockItems(physicalStoreId: String!, queryString: String): PagedStockItem
  @checkStoreAccess(permissions: [IN_MANAGE_STOCK_ITEMS, IN_VIEW_ISSUANCE_FORMS, IN_MANAGE_ISSUANCE_FORMS, IN_APPROVE_ISSUANCE_FORMS, IN_VIEW_PURCHASE_FORMS, IN_MANAGE_PURCHASE_FORMS, IN_APPROVE_PURCHASE_FORMS, IN_VIEW_STOCK_ADJUSTMENTS, IN_MANAGE_STOCK_ADJUSTMENTS, IN_APPROVE_STOCK_ADJUSTMENTS], physicalStoreIdArgName: "physicalStoreId", returnType: "paged-list")

  stockItemById(_id: String!, physicalStoreId: String!): StockItem
  @checkStoreAccess(permissions: [IN_MANAGE_STOCK_ITEMS, IN_VIEW_ISSUANCE_FORMS, IN_MANAGE_ISSUANCE_FORMS, IN_APPROVE_ISSUANCE_FORMS, IN_VIEW_PURCHASE_FORMS, IN_MANAGE_PURCHASE_FORMS, IN_APPROVE_PURCHASE_FORMS, IN_VIEW_STOCK_ADJUSTMENTS, IN_MANAGE_STOCK_ADJUSTMENTS, IN_APPROVE_STOCK_ADJUSTMENTS], physicalStoreIdArgName: "physicalStoreId", returnType: "object")

  stockItemsById(_ids: [String]!, physicalStoreId: String!): [StockItem]
  @checkStoreAccess(permissions: [IN_MANAGE_STOCK_ITEMS, IN_VIEW_ISSUANCE_FORMS, IN_MANAGE_ISSUANCE_FORMS, IN_APPROVE_ISSUANCE_FORMS, IN_VIEW_PURCHASE_FORMS, IN_MANAGE_PURCHASE_FORMS, IN_APPROVE_PURCHASE_FORMS, IN_VIEW_STOCK_ADJUSTMENTS, IN_MANAGE_STOCK_ADJUSTMENTS, IN_APPROVE_STOCK_ADJUSTMENTS], physicalStoreIdArgName: "physicalStoreId", returnType: "list")
}

extend type Mutation {
  createStockItem(
    name: String!
    company: String
    details: String
    unitOfMeasurement: String!
    categoryId: String!
    physicalStoreId: String!
    minStockLevel: Float
    currentStockLevel: Float
  ): StockItem
  @checkStoreAccess(permissions: [IN_MANAGE_STOCK_ITEMS], physicalStoreIdArgName: "physicalStoreId")

  updateStockItem(
    _id: String!
    physicalStoreId: String!
    name: String!
    company: String
    details: String
    unitOfMeasurement: String!
    categoryId: String!
    minStockLevel: Float
  ): StockItem
  @checkStoreAccess(permissions: [IN_MANAGE_STOCK_ITEMS], physicalStoreIdArgName: "physicalStoreId")

  verifyStockItemLevel(_id: String!, physicalStoreId: String!): StockItem
  @checkStoreAccess(permissions: [IN_MANAGE_STOCK_ITEMS], physicalStoreIdArgName: "physicalStoreId")

  removeStockItem(_id: String!, physicalStoreId: String!): Int
  @checkStoreAccess(permissions: [IN_MANAGE_STOCK_ITEMS], physicalStoreIdArgName: "physicalStoreId")

  setStockItemImage(_id: String!, physicalStoreId: String!, imageData: String!): StockItem
  @checkStoreAccess(permissions: [IN_MANAGE_STOCK_ITEMS], physicalStoreIdArgName: "physicalStoreId")

  mergeStockItems(_idToKeep: String!, _idsToMerge: [String]!, physicalStoreId: String!): StockItem
  @checkStoreAccess(permissions: [IN_MANAGE_STOCK_ITEMS], physicalStoreIdArgName: "physicalStoreId")

  recalculateStockLevels(_ids: [String]!, physicalStoreId: String!): [StockItem]
  @checkStoreAccess(permissions: [IN_MANAGE_STOCK_ITEMS], physicalStoreIdArgName: "physicalStoreId")
}
`;
