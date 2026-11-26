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

type PurchasingPermissionCommitteeHolder {
  committeeId: String!
  name: String!
  locationName: String
}

type PurchasingPermissionAssignment {
  key: String!
  name: String!
  description: String
  users: [PurchasingPermissionHolder]
  groups: [PurchasingPermissionGroupHolder]
  # Committees whose members and coordinators hold the permission.
  committees: [PurchasingPermissionCommitteeHolder]
}

type PurchasingPermissionGroup {
  featureKey: String!
  featureName: String!
  permissions: [PurchasingPermissionAssignment]
}

extend type Query {
  purchasingPermissionAssignments: [PurchasingPermissionGroup]
    @checkPermissions(permissions: [PURCHASING_MANAGE_PERMISSIONS])

  # Karkuns to choose from when giving a permission or adding to a group.
  pagedPurchasingPermissionKarkuns(
    name: String
    cnicNumber: String
    phoneNumber: String
    pageIndex: String
    pageSize: String
  ): PagedPickerPersonType
    @checkPermissions(permissions: [PURCHASING_MANAGE_PERMISSIONS])
}

extend type Mutation {
  addPurchasingPermissionUser(permissionKey: String!, karkunId: String!): Boolean
    @checkPermissions(permissions: [PURCHASING_MANAGE_PERMISSIONS])

  addPurchasingPermissionGroup(permissionKey: String!, groupId: String!): Boolean
    @checkPermissions(permissions: [PURCHASING_MANAGE_PERMISSIONS])

  removePurchasingPermissionGroup(permissionKey: String!, groupId: String!): Boolean
    @checkPermissions(permissions: [PURCHASING_MANAGE_PERMISSIONS])

  addPurchasingPermissionCommittee(permissionKey: String!, committeeId: String!): Boolean
    @checkPermissions(permissions: [PURCHASING_MANAGE_PERMISSIONS])

  removePurchasingPermissionCommittee(permissionKey: String!, committeeId: String!): Boolean
    @checkPermissions(permissions: [PURCHASING_MANAGE_PERMISSIONS])

  removePurchasingPermissionUser(permissionKey: String!, userId: String!): Boolean
    @checkPermissions(permissions: [PURCHASING_MANAGE_PERMISSIONS])
}
`;
