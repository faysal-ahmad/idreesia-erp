import gql from 'graphql-tag';

export default gql`
type SecurityGroupMember {
  userId: String!
  personId: String
  username: String
  displayName: String
}

type SecurityUserGroup {
  _id: String!
  name: String!
  description: String
  users: [SecurityGroupMember]
}

extend type Query {
  securityUserGroups: [SecurityUserGroup]
    @checkPermissions(permissions: [SECURITY_MANAGE_PERMISSIONS])
}

extend type Mutation {
  createSecurityUserGroup(name: String!, description: String): SecurityUserGroup
    @checkPermissions(permissions: [SECURITY_MANAGE_PERMISSIONS])

  updateSecurityUserGroup(_id: String!, name: String!, description: String): SecurityUserGroup
    @checkPermissions(permissions: [SECURITY_MANAGE_PERMISSIONS])

  deleteSecurityUserGroup(_id: String!): Boolean
    @checkPermissions(permissions: [SECURITY_MANAGE_PERMISSIONS])

  addSecurityGroupMember(groupId: String!, karkunId: String!): Boolean
    @checkPermissions(permissions: [SECURITY_MANAGE_PERMISSIONS])

  removeSecurityGroupMember(groupId: String!, userId: String!): Boolean
    @checkPermissions(permissions: [SECURITY_MANAGE_PERMISSIONS])
}
`;
