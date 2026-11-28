import gql from 'graphql-tag';

export default gql`
type StoreUserGroupMember {
  userId: String!
  personId: String
  username: String
  displayName: String
}

type StoreUserGroup {
  _id: String!
  name: String!
  description: String
  users: [StoreUserGroupMember]
}

extend type Query {
  # The Stores user groups (shared by all stores), with their members.
  storeUserGroups: [StoreUserGroup]
    @checkPermissions(permissions: [IN_MANAGE_PHYSICAL_STORES, IN_MANAGE_PHYSICAL_STORE_PERMISSIONS])

  # Karkuns of Multan (with an unlocked user account) to give a store
  # permission to or to add to a Stores group.
  pagedStorePermissionKarkuns(
    name: String
    cnicNumber: String
    phoneNumber: String
    pageIndex: String
    pageSize: String
  ): PagedPickerPersonType
    @checkPermissions(permissions: [IN_MANAGE_PHYSICAL_STORES, IN_MANAGE_PHYSICAL_STORE_PERMISSIONS])
}

extend type Mutation {
  createStoreUserGroup(name: String!, description: String): StoreUserGroup
    @checkPermissions(permissions: [IN_MANAGE_PHYSICAL_STORES, IN_MANAGE_PHYSICAL_STORE_PERMISSIONS])

  updateStoreUserGroup(
    _id: String!
    name: String!
    description: String
  ): StoreUserGroup
    @checkPermissions(permissions: [IN_MANAGE_PHYSICAL_STORES, IN_MANAGE_PHYSICAL_STORE_PERMISSIONS])

  deleteStoreUserGroup(_id: String!): Boolean
    @checkPermissions(permissions: [IN_MANAGE_PHYSICAL_STORES, IN_MANAGE_PHYSICAL_STORE_PERMISSIONS])

  addStoreUserGroupMember(groupId: String!, karkunId: String!): Boolean
    @checkPermissions(permissions: [IN_MANAGE_PHYSICAL_STORES, IN_MANAGE_PHYSICAL_STORE_PERMISSIONS])

  removeStoreUserGroupMember(groupId: String!, userId: String!): Boolean
    @checkPermissions(permissions: [IN_MANAGE_PHYSICAL_STORES, IN_MANAGE_PHYSICAL_STORE_PERMISSIONS])
}
`;
