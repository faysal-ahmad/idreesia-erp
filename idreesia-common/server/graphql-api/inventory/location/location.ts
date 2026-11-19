import gql from 'graphql-tag';

export default gql`
type Location {
  _id: String
  name: String
  parentId: String
  physicalStoreId: String
  description: String

  refParent: Location
  isInUse: Boolean

  createdAt: String
  createdBy: String
  updatedAt: String
  updatedBy: String
}

extend type Query {
  locationById(_id: String!, physicalStoreId: String!): Location
  @checkPermissions(permissions: [IN_MANAGE_SETUP_DATA])
  @checkInstanceAccess(instanceIdArgName: "physicalStoreId", returnType: "object")

  locationsByPhysicalStoreId(physicalStoreId: String!): [Location]
  @checkPermissions(permissions: [IN_MANAGE_SETUP_DATA, IN_VIEW_ISSUANCE_FORMS, IN_MANAGE_ISSUANCE_FORMS, IN_APPROVE_ISSUANCE_FORMS, IN_VIEW_PURCHASE_FORMS, IN_MANAGE_PURCHASE_FORMS, IN_APPROVE_PURCHASE_FORMS])
  @checkInstanceAccess(instanceIdArgName: "physicalStoreId", returnType: "list")
}

extend type Mutation {
  createLocation(
    name: String!
    physicalStoreId: String!
    parentId: String
    description: String
  ): Location
  @checkPermissions(permissions: [IN_MANAGE_SETUP_DATA])
  @checkInstanceAccess(instanceIdArgName: "physicalStoreId")

  updateLocation(
    _id: String!
    physicalStoreId: String!
    name: String!
    parentId: String
    description: String
  ): Location
  @checkPermissions(permissions: [IN_MANAGE_SETUP_DATA])
  @checkInstanceAccess(instanceIdArgName: "physicalStoreId")

  removeLocation(_id: String!, physicalStoreId: String!): Int
  @checkPermissions(permissions: [IN_MANAGE_SETUP_DATA])
  @checkInstanceAccess(instanceIdArgName: "physicalStoreId")
}
`;
