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

type HrPermissionAssignment {
  key: String!
  name: String!
  description: String
  users: [HrPermissionHolder]
  groups: [HrPermissionGroupHolder]
}

type HrPermissionGroup {
  featureKey: String!
  featureName: String!
  permissions: [HrPermissionAssignment]
}

type HrPermissionKarkunType {
  _id: String
  name: String
  parentName: String
  cnicNumber: String
  contactNumber1: String
  imageUrl: String
  imageThumbnailUrl: String
}

type PagedHrPermissionKarkunType {
  data: [HrPermissionKarkunType]
  totalResults: Int
}

extend type Query {
  hrPermissionAssignments: [HrPermissionGroup]
    @checkPermissions(permissions: [HR_MANAGE_PERMISSIONS])

  # Karkuns to choose from when giving a permission or adding to a group.
  hrPermissionKarkunSearch(
    name: String
    cnicNumber: String
    phoneNumber: String
    pageIndex: String
    pageSize: String
  ): PagedHrPermissionKarkunType
    @checkPermissions(permissions: [HR_MANAGE_PERMISSIONS])
}

extend type Mutation {
  addHrPermissionUser(permissionKey: String!, karkunId: String!): Boolean
    @checkPermissions(permissions: [HR_MANAGE_PERMISSIONS])

  addHrPermissionGroup(permissionKey: String!, groupId: String!): Boolean
    @checkPermissions(permissions: [HR_MANAGE_PERMISSIONS])

  removeHrPermissionGroup(permissionKey: String!, groupId: String!): Boolean
    @checkPermissions(permissions: [HR_MANAGE_PERMISSIONS])

  removeHrPermissionUser(permissionKey: String!, userId: String!): Boolean
    @checkPermissions(permissions: [HR_MANAGE_PERMISSIONS])
}
`;
