import gql from 'graphql-tag';

// Types shared by the Permissions pages of HR - Karkuns and HR - Employees.
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

type HrGroupMember {
  userId: String!
  personId: String
  username: String
  displayName: String
}

type HrUserGroup {
  _id: String!
  name: String!
  description: String
  users: [HrGroupMember]
}
`;
