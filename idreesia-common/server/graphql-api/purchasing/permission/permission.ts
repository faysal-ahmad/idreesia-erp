import gql from 'graphql-tag';

export default gql`
type PurchasingPermissionHolder {
  userId: String!
  personId: String
  username: String
  displayName: String
}

type PurchasingPermissionGroupHolder {
  groupId: String!
  name: String!
}

type PurchasingPermissionAssignment {
  key: String!
  name: String!
  description: String
  users: [PurchasingPermissionHolder]
  groups: [PurchasingPermissionGroupHolder]
}

type PurchasingPermissionGroup {
  featureKey: String!
  featureName: String!
  permissions: [PurchasingPermissionAssignment]
}

type PurchasingKarkunType {
  _id: String
  name: String
  parentName: String
  cnicNumber: String
  contactNumber1: String
  imageUrl: String
  imageThumbnailUrl: String
}

type PagedPurchasingKarkunType {
  data: [PurchasingKarkunType]
  totalResults: Int
}

extend type Query {
  purchasingPermissionAssignments: [PurchasingPermissionGroup]
    @checkPermissions(permissions: [PURCHASING_MANAGE_PERMISSIONS])

  # Karkuns to choose from when giving a permission or adding to a group.
  purchasingKarkunSearch(
    name: String
    cnicNumber: String
    phoneNumber: String
    pageIndex: String
    pageSize: String
  ): PagedPurchasingKarkunType
    @checkPermissions(permissions: [PURCHASING_MANAGE_PERMISSIONS])
}

extend type Mutation {
  addPurchasingPermissionUser(permissionKey: String!, karkunId: String!): Boolean
    @checkPermissions(permissions: [PURCHASING_MANAGE_PERMISSIONS])

  addPurchasingPermissionGroup(permissionKey: String!, groupId: String!): Boolean
    @checkPermissions(permissions: [PURCHASING_MANAGE_PERMISSIONS])

  removePurchasingPermissionGroup(permissionKey: String!, groupId: String!): Boolean
    @checkPermissions(permissions: [PURCHASING_MANAGE_PERMISSIONS])

  removePurchasingPermissionUser(permissionKey: String!, userId: String!): Boolean
    @checkPermissions(permissions: [PURCHASING_MANAGE_PERMISSIONS])
}
`;
