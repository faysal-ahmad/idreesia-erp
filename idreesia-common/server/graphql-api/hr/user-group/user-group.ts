import gql from 'graphql-tag';

export default gql`
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

extend type Query {
  hrUserGroups: [HrUserGroup]
    @checkPermissions(permissions: [HR_MANAGE_PERMISSIONS])
}

extend type Mutation {
  createHrUserGroup(name: String!, description: String): HrUserGroup
    @checkPermissions(permissions: [HR_MANAGE_PERMISSIONS])

  updateHrUserGroup(_id: String!, name: String!, description: String): HrUserGroup
    @checkPermissions(permissions: [HR_MANAGE_PERMISSIONS])

  deleteHrUserGroup(_id: String!): Boolean
    @checkPermissions(permissions: [HR_MANAGE_PERMISSIONS])

  addHrGroupMember(groupId: String!, karkunId: String!): Boolean
    @checkPermissions(permissions: [HR_MANAGE_PERMISSIONS])

  removeHrGroupMember(groupId: String!, userId: String!): Boolean
    @checkPermissions(permissions: [HR_MANAGE_PERMISSIONS])
}
`;
