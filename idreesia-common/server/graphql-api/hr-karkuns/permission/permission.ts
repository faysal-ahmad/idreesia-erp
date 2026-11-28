import gql from 'graphql-tag';

// HR - Karkuns's Permissions page: its own permissions only.
export default gql`
extend type Query {
  hrKarkunsPermissionAssignments: [HrPermissionGroup]
    @checkPermissions(permissions: [HR_KARKUNS_MANAGE_PERMISSIONS])

  # Karkuns to choose from when giving a permission or adding to a group.
  pagedHrKarkunsPermissionKarkuns(
    name: String
    cnicNumber: String
    phoneNumber: String
    pageIndex: String
    pageSize: String
  ): PagedPickerPersonType
    @checkPermissions(permissions: [HR_KARKUNS_MANAGE_PERMISSIONS])
}

extend type Mutation {
  addHrKarkunsPermissionUser(permissionKey: String!, karkunId: String!): Boolean
    @checkPermissions(permissions: [HR_KARKUNS_MANAGE_PERMISSIONS])

  removeHrKarkunsPermissionUser(permissionKey: String!, userId: String!): Boolean
    @checkPermissions(permissions: [HR_KARKUNS_MANAGE_PERMISSIONS])

  addHrKarkunsPermissionGroup(permissionKey: String!, groupId: String!): Boolean
    @checkPermissions(permissions: [HR_KARKUNS_MANAGE_PERMISSIONS])

  removeHrKarkunsPermissionGroup(permissionKey: String!, groupId: String!): Boolean
    @checkPermissions(permissions: [HR_KARKUNS_MANAGE_PERMISSIONS])

  addHrKarkunsPermissionCommittee(permissionKey: String!, committeeId: String!): Boolean
    @checkPermissions(permissions: [HR_KARKUNS_MANAGE_PERMISSIONS])

  removeHrKarkunsPermissionCommittee(permissionKey: String!, committeeId: String!): Boolean
    @checkPermissions(permissions: [HR_KARKUNS_MANAGE_PERMISSIONS])
}
`;
