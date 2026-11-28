import gql from 'graphql-tag';

// HR - Karkuns's own user groups (moduleName 'HR - Karkuns').
export default gql`
extend type Query {
  hrKarkunsUserGroups: [HrUserGroup]
    @checkPermissions(permissions: [HR_KARKUNS_MANAGE_PERMISSIONS])
}

extend type Mutation {
  createHrKarkunsUserGroup(name: String!, description: String): HrUserGroup
    @checkPermissions(permissions: [HR_KARKUNS_MANAGE_PERMISSIONS])

  updateHrKarkunsUserGroup(_id: String!, name: String!, description: String): HrUserGroup
    @checkPermissions(permissions: [HR_KARKUNS_MANAGE_PERMISSIONS])

  deleteHrKarkunsUserGroup(_id: String!): Boolean
    @checkPermissions(permissions: [HR_KARKUNS_MANAGE_PERMISSIONS])

  addHrKarkunsGroupMember(groupId: String!, karkunId: String!): Boolean
    @checkPermissions(permissions: [HR_KARKUNS_MANAGE_PERMISSIONS])

  removeHrKarkunsGroupMember(groupId: String!, userId: String!): Boolean
    @checkPermissions(permissions: [HR_KARKUNS_MANAGE_PERMISSIONS])
}
`;
