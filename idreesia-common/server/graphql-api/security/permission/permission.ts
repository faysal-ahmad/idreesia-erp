import gql from 'graphql-tag';

export default gql`
type SecurityPermissionHolder {
  userId: String!
  personId: String
  username: String
  displayName: String
}

type SecurityPermissionGroupHolder {
  groupId: String!
  name: String!
}

type SecurityPermissionAssignment {
  key: String!
  name: String!
  description: String
  users: [SecurityPermissionHolder]
  groups: [SecurityPermissionGroupHolder]
}

type SecurityPermissionGroup {
  featureKey: String!
  featureName: String!
  permissions: [SecurityPermissionAssignment]
}

extend type Query {
  securityPermissionAssignments: [SecurityPermissionGroup]
    @checkPermissions(permissions: [SECURITY_MANAGE_PERMISSIONS])

  # Karkuns of Multan (with an unlocked user account) to choose from when giving a permission or adding to a group.
  pagedSecurityPermissionKarkuns(
    name: String
    cnicNumber: String
    phoneNumber: String
    pageIndex: String
    pageSize: String
  ): PagedPickerPersonType
    @checkPermissions(permissions: [SECURITY_MANAGE_PERMISSIONS])
}

extend type Mutation {
  addSecurityPermissionUser(permissionKey: String!, karkunId: String!): Boolean
    @checkPermissions(permissions: [SECURITY_MANAGE_PERMISSIONS])

  addSecurityPermissionGroup(permissionKey: String!, groupId: String!): Boolean
    @checkPermissions(permissions: [SECURITY_MANAGE_PERMISSIONS])

  removeSecurityPermissionGroup(permissionKey: String!, groupId: String!): Boolean
    @checkPermissions(permissions: [SECURITY_MANAGE_PERMISSIONS])

  removeSecurityPermissionUser(permissionKey: String!, userId: String!): Boolean
    @checkPermissions(permissions: [SECURITY_MANAGE_PERMISSIONS])
}
`;
