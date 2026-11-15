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
    @checkInstanceAccess(instanceIdArgName: "id", returnType: "object")
}

extend type Mutation {
  createPhysicalStore(name: String!, address: String): PhysicalStore
  @checkPermissions(permissions: [ADMIN_MANAGE_PHYSICAL_STORES])

  updatePhysicalStore(id: String!, name: String!, address: String): PhysicalStore
  @checkPermissions(permissions: [ADMIN_MANAGE_PHYSICAL_STORES])
}
`;
