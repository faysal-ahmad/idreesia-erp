import gql from 'graphql-tag';

export default gql`
type ItemCategory {
  _id: String
  name: String
  physicalStoreId: String
  stockItemCount: Int

  createdAt: String
  createdBy: String
  updatedAt: String
  updatedBy: String
}

extend type Query {
  itemCategoryById(_id: String!, physicalStoreId: String!): ItemCategory
  @checkStoreAccess(permissions: [IN_MANAGE_SETUP_DATA], physicalStoreIdArgName: "physicalStoreId", returnType: "object")

  itemCategoriesByPhysicalStoreId(physicalStoreId: String!): [ItemCategory]
  @checkStoreAccess(permissions: [IN_MANAGE_SETUP_DATA, IN_MANAGE_STOCK_ITEMS], physicalStoreIdArgName: "physicalStoreId", returnType: "list")
}

extend type Mutation {
  createItemCategory(name: String!, physicalStoreId: String!): ItemCategory
  @checkStoreAccess(permissions: [IN_MANAGE_SETUP_DATA], physicalStoreIdArgName: "physicalStoreId")
  
  updateItemCategory(_id: String!, physicalStoreId: String!, name: String!): ItemCategory
  @checkStoreAccess(permissions: [IN_MANAGE_SETUP_DATA], physicalStoreIdArgName: "physicalStoreId")
  
  removeItemCategory(_id: String!, physicalStoreId: String!): Int
  @checkStoreAccess(permissions: [IN_MANAGE_SETUP_DATA], physicalStoreIdArgName: "physicalStoreId")
}
`;
