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
  # What the caller may do on the store. Only set by allAccessiblePhysicalStores.
  permissions: [String]
}

type StorePermissionUserHolder {
  userId: String
  personId: String
  username: String
  displayName: String
}

type StorePermissionGroupHolder {
  groupId: String
  name: String
}

type StorePermissionHolders {
  key: String
  name: String
  groupName: String
  users: [StorePermissionUserHolder]
  groups: [StorePermissionGroupHolder]
}

extend type Query {
  allAccessiblePhysicalStores: [PhysicalStore]
  physicalStoreAccess(physicalStoreId: String!): [StorePermissionHolders]
    @checkPermissions(permissions: [IN_MANAGE_PHYSICAL_STORES, IN_MANAGE_PHYSICAL_STORE_PERMISSIONS])

  # Every store, for Stores / Administration / Manage Stores.
  managedPhysicalStores: [PhysicalStore]
    @checkPermissions(permissions: [IN_MANAGE_PHYSICAL_STORES, IN_MANAGE_PHYSICAL_STORE_PERMISSIONS])
  managedPhysicalStoreById(id: String!): PhysicalStore
    @checkPermissions(permissions: [IN_MANAGE_PHYSICAL_STORES, IN_MANAGE_PHYSICAL_STORE_PERMISSIONS])
  physicalStoreById(id: String!): PhysicalStore
    @checkStoreAccess(permissions: [IN_MANAGE_SETUP_DATA, IN_MANAGE_STOCK_ITEMS, IN_VIEW_ISSUANCE_FORMS, IN_MANAGE_ISSUANCE_FORMS, IN_APPROVE_ISSUANCE_FORMS, IN_VIEW_PURCHASE_FORMS, IN_MANAGE_PURCHASE_FORMS, IN_APPROVE_PURCHASE_FORMS, IN_VIEW_STOCK_ADJUSTMENTS, IN_MANAGE_STOCK_ADJUSTMENTS, IN_APPROVE_STOCK_ADJUSTMENTS], physicalStoreIdArgName: "id", returnType: "object")
}

extend type Mutation {
  createPhysicalStore(name: String!, address: String): PhysicalStore
  @checkPermissions(permissions: [IN_MANAGE_PHYSICAL_STORES])

  updatePhysicalStore(id: String!, name: String!, address: String): PhysicalStore
  @checkPermissions(permissions: [IN_MANAGE_PHYSICAL_STORES])

  addPhysicalStoreAccessUser(physicalStoreId: String!, permission: String!, karkunId: String!): Boolean
  @checkPermissions(permissions: [IN_MANAGE_PHYSICAL_STORES, IN_MANAGE_PHYSICAL_STORE_PERMISSIONS])

  removePhysicalStoreAccessUser(physicalStoreId: String!, permission: String!, userId: String!): Boolean
  @checkPermissions(permissions: [IN_MANAGE_PHYSICAL_STORES, IN_MANAGE_PHYSICAL_STORE_PERMISSIONS])

  addPhysicalStoreAccessGroup(physicalStoreId: String!, permission: String!, groupId: String!): Boolean
  @checkPermissions(permissions: [IN_MANAGE_PHYSICAL_STORES, IN_MANAGE_PHYSICAL_STORE_PERMISSIONS])

  removePhysicalStoreAccessGroup(physicalStoreId: String!, permission: String!, groupId: String!): Boolean
  @checkPermissions(permissions: [IN_MANAGE_PHYSICAL_STORES, IN_MANAGE_PHYSICAL_STORE_PERMISSIONS])
}
`;
