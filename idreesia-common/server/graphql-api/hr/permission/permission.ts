import gql from 'graphql-tag';

export default gql`
type HrPermissionHolder {
  userId: String!
  personId: String
  username: String
  displayName: String
}

type HrPermissionGroupHolder {
  groupId: String!
  name: String!
}

type HrPermissionCommitteeHolder {
  committeeId: String!
  name: String!
  locationName: String
}

type HrPermissionAssignment {
  key: String!
  name: String!
  description: String
  users: [HrPermissionHolder]
  groups: [HrPermissionGroupHolder]
  # Committees whose members and coordinators hold the permission.
  committees: [HrPermissionCommitteeHolder]
}

type HrPermissionGroup {
  featureKey: String!
  featureName: String!
  permissions: [HrPermissionAssignment]
}

extend type Query {
  hrPermissionAssignments: [HrPermissionGroup]
    @checkPermissions(permissions: [HR_MANAGE_PERMISSIONS])

  # Karkuns to choose from when giving a permission or adding to a group.
  pagedHrPermissionKarkuns(
    name: String
    cnicNumber: String
    phoneNumber: String
    pageIndex: String
    pageSize: String
  ): PagedPickerPersonType
    @checkPermissions(permissions: [HR_MANAGE_PERMISSIONS])
}

extend type Mutation {
  addHrPermissionUser(permissionKey: String!, karkunId: String!): Boolean
    @checkPermissions(permissions: [HR_MANAGE_PERMISSIONS])

  addHrPermissionGroup(permissionKey: String!, groupId: String!): Boolean
    @checkPermissions(permissions: [HR_MANAGE_PERMISSIONS])

  removeHrPermissionGroup(permissionKey: String!, groupId: String!): Boolean
    @checkPermissions(permissions: [HR_MANAGE_PERMISSIONS])

  addHrPermissionCommittee(permissionKey: String!, committeeId: String!): Boolean
    @checkPermissions(permissions: [HR_MANAGE_PERMISSIONS])

  removeHrPermissionCommittee(permissionKey: String!, committeeId: String!): Boolean
    @checkPermissions(permissions: [HR_MANAGE_PERMISSIONS])

  removeHrPermissionUser(permissionKey: String!, userId: String!): Boolean
    @checkPermissions(permissions: [HR_MANAGE_PERMISSIONS])
}
`;
