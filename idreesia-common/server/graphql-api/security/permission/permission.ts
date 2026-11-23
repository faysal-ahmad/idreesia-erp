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

type SecurityPermissionKarkunType {
  _id: String
  name: String
  parentName: String
  cnicNumber: String
  contactNumber1: String
  imageUrl: String
  imageThumbnailUrl: String
}

type PagedSecurityPermissionKarkunType {
  data: [SecurityPermissionKarkunType]
  totalResults: Int
}

extend type Query {
  securityPermissionAssignments: [SecurityPermissionGroup]
    @checkPermissions(permissions: [SECURITY_MANAGE_PERMISSIONS])

  # Karkuns to choose from when giving a permission or adding to a group.
  securityPermissionKarkunSearch(
    name: String
    cnicNumber: String
    phoneNumber: String
    pageIndex: String
    pageSize: String
  ): PagedSecurityPermissionKarkunType
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
