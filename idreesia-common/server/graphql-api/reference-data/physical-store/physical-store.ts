import gql from 'graphql-tag';

// Physical stores are owned by Stores, but Admin manages them and assigns
// access to them. Stores itself uses allAccessiblePhysicalStores and
// physicalStoreById.
export default gql`
type ReferencePhysicalStoreType {
  _id: String
  name: String
  address: String
}

extend type Query {
  referencePhysicalStores: [ReferencePhysicalStoreType]
    @checkPermissions(
      permissions: [
        ADMIN_VIEW_USERS_AND_GROUPS
        ADMIN_MANAGE_USERS_AND_GROUPS
        ADMIN_MANAGE_PHYSICAL_STORES
      ]
    )
  referencePhysicalStoreById(id: String!): ReferencePhysicalStoreType
    @checkPermissions(permissions: [ADMIN_MANAGE_PHYSICAL_STORES])
}
`;
