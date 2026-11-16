import gql from 'graphql-tag';

export default gql`
type PhysicalStore {
  _id: String
  name: String
  address: String
  createdAt: String
  createdBy: String
  updatedAt: String
  updatedBy: String
}

extend type Query {
  allAccessiblePhysicalStores: [PhysicalStore]
  physicalStoreById(id: String!): PhysicalStore
    @checkPermissions(permissions: [IN_MANAGE_SETUP_DATA, IN_MANAGE_STOCK_ITEMS, IN_VIEW_ISSUANCE_FORMS, IN_MANAGE_ISSUANCE_FORMS, IN_APPROVE_ISSUANCE_FORMS, IN_VIEW_PURCHASE_FORMS, IN_MANAGE_PURCHASE_FORMS, IN_APPROVE_PURCHASE_FORMS, IN_VIEW_STOCK_ADJUSTMENTS, IN_MANAGE_STOCK_ADJUSTMENTS, IN_APPROVE_STOCK_ADJUSTMENTS])
    @checkInstanceAccess(instanceIdArgName: "id", returnType: "object")
}

extend type Mutation {
  createPhysicalStore(name: String!, address: String): PhysicalStore
  @checkPermissions(permissions: [ADMIN_MANAGE_PHYSICAL_STORES])

  updatePhysicalStore(id: String!, name: String!, address: String): PhysicalStore
  @checkPermissions(permissions: [ADMIN_MANAGE_PHYSICAL_STORES])
}
`;
