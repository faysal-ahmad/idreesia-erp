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

type StoreAccessKarkun {
  _id: String
  name: String
  parentName: String
  cnicNumber: String
  contactNumber1: String
  imageUrl: String
  imageThumbnailUrl: String
}

type PagedStoreAccessKarkun {
  data: [StoreAccessKarkun]
  totalResults: Int
}

type StoreAccessUserGroup {
  _id: String
  name: String
  description: String
}

extend type Query {
  allAccessiblePhysicalStores: [PhysicalStore]
  physicalStoreAccess(physicalStoreId: String!): [StorePermissionHolders]
    @checkPermissions(permissions: [ADMIN_MANAGE_PHYSICAL_STORES])

  # Karkuns (with a user account) and user groups to give store permissions to.
  storeAccessKarkunSearch(
    name: String
    cnicNumber: String
    phoneNumber: String
    pageIndex: String
    pageSize: String
  ): PagedStoreAccessKarkun
    @checkPermissions(permissions: [ADMIN_MANAGE_PHYSICAL_STORES])
  storeAccessUserGroups: [StoreAccessUserGroup]
    @checkPermissions(permissions: [ADMIN_MANAGE_PHYSICAL_STORES])
  physicalStoreById(id: String!): PhysicalStore
    @checkStoreAccess(permissions: [IN_MANAGE_SETUP_DATA, IN_MANAGE_STOCK_ITEMS, IN_VIEW_ISSUANCE_FORMS, IN_MANAGE_ISSUANCE_FORMS, IN_APPROVE_ISSUANCE_FORMS, IN_VIEW_PURCHASE_FORMS, IN_MANAGE_PURCHASE_FORMS, IN_APPROVE_PURCHASE_FORMS, IN_VIEW_STOCK_ADJUSTMENTS, IN_MANAGE_STOCK_ADJUSTMENTS, IN_APPROVE_STOCK_ADJUSTMENTS], physicalStoreIdArgName: "id", returnType: "object")
}

extend type Mutation {
  createPhysicalStore(name: String!, address: String): PhysicalStore
  @checkPermissions(permissions: [ADMIN_MANAGE_PHYSICAL_STORES])

  updatePhysicalStore(id: String!, name: String!, address: String): PhysicalStore
  @checkPermissions(permissions: [ADMIN_MANAGE_PHYSICAL_STORES])

  addPhysicalStoreAccessUser(physicalStoreId: String!, permission: String!, karkunId: String!): Boolean
  @checkPermissions(permissions: [ADMIN_MANAGE_PHYSICAL_STORES])

  removePhysicalStoreAccessUser(physicalStoreId: String!, permission: String!, userId: String!): Boolean
  @checkPermissions(permissions: [ADMIN_MANAGE_PHYSICAL_STORES])

  addPhysicalStoreAccessGroup(physicalStoreId: String!, permission: String!, groupId: String!): Boolean
  @checkPermissions(permissions: [ADMIN_MANAGE_PHYSICAL_STORES])

  removePhysicalStoreAccessGroup(physicalStoreId: String!, permission: String!, groupId: String!): Boolean
  @checkPermissions(permissions: [ADMIN_MANAGE_PHYSICAL_STORES])
}
`;
