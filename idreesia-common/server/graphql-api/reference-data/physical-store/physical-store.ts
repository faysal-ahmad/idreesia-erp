import gql from 'graphql-tag';

// Physical stores are owned by Stores, which uses its own queries
// (allAccessiblePhysicalStores, physicalStoreById, managedPhysicalStores).
// Purchasing shows which store a requisition or order came from.
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
        PURCHASING_VIEW_REQUISITIONS
        PURCHASING_MANAGE_REQUISITIONS
        PURCHASING_APPROVE_REQUISITIONS
        PURCHASING_VIEW_ORDERS
        PURCHASING_MANAGE_ORDERS
        PURCHASING_VIEW_PETTY_CASH
        PURCHASING_MANAGE_PETTY_CASH_VOUCHERS
      ]
    )
}
`;
