import gql from 'graphql-tag';

// HR - Employees's Permissions page: its own permissions only.
export default gql`
extend type Query {
  hrEmployeesPermissionAssignments: [HrPermissionGroup]
    @checkPermissions(permissions: [HR_EMPLOYEES_MANAGE_PERMISSIONS])

  # Karkuns to choose from when giving a permission or adding to a group.
  pagedHrEmployeesPermissionKarkuns(
    name: String
    cnicNumber: String
    phoneNumber: String
    pageIndex: String
    pageSize: String
  ): PagedPickerPersonType
    @checkPermissions(permissions: [HR_EMPLOYEES_MANAGE_PERMISSIONS])
}

extend type Mutation {
  addHrEmployeesPermissionUser(permissionKey: String!, karkunId: String!): Boolean
    @checkPermissions(permissions: [HR_EMPLOYEES_MANAGE_PERMISSIONS])

  removeHrEmployeesPermissionUser(permissionKey: String!, userId: String!): Boolean
    @checkPermissions(permissions: [HR_EMPLOYEES_MANAGE_PERMISSIONS])

  addHrEmployeesPermissionGroup(permissionKey: String!, groupId: String!): Boolean
    @checkPermissions(permissions: [HR_EMPLOYEES_MANAGE_PERMISSIONS])

  removeHrEmployeesPermissionGroup(permissionKey: String!, groupId: String!): Boolean
    @checkPermissions(permissions: [HR_EMPLOYEES_MANAGE_PERMISSIONS])

  addHrEmployeesPermissionCommittee(permissionKey: String!, committeeId: String!): Boolean
    @checkPermissions(permissions: [HR_EMPLOYEES_MANAGE_PERMISSIONS])

  removeHrEmployeesPermissionCommittee(permissionKey: String!, committeeId: String!): Boolean
    @checkPermissions(permissions: [HR_EMPLOYEES_MANAGE_PERMISSIONS])
}
`;
