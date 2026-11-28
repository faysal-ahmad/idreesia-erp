import gql from 'graphql-tag';

// HR - Employees's own user groups (moduleName 'HR - Employees').
export default gql`
extend type Query {
  hrEmployeesUserGroups: [HrUserGroup]
    @checkPermissions(permissions: [HR_EMPLOYEES_MANAGE_PERMISSIONS])
}

extend type Mutation {
  createHrEmployeesUserGroup(name: String!, description: String): HrUserGroup
    @checkPermissions(permissions: [HR_EMPLOYEES_MANAGE_PERMISSIONS])

  updateHrEmployeesUserGroup(_id: String!, name: String!, description: String): HrUserGroup
    @checkPermissions(permissions: [HR_EMPLOYEES_MANAGE_PERMISSIONS])

  deleteHrEmployeesUserGroup(_id: String!): Boolean
    @checkPermissions(permissions: [HR_EMPLOYEES_MANAGE_PERMISSIONS])

  addHrEmployeesGroupMember(groupId: String!, karkunId: String!): Boolean
    @checkPermissions(permissions: [HR_EMPLOYEES_MANAGE_PERMISSIONS])

  removeHrEmployeesGroupMember(groupId: String!, userId: String!): Boolean
    @checkPermissions(permissions: [HR_EMPLOYEES_MANAGE_PERMISSIONS])
}
`;
