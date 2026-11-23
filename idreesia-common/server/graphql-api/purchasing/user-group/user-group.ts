import gql from 'graphql-tag';

export default gql`
type PurchasingGroupMember {
  userId: String!
  personId: String
  username: String
  displayName: String
}

type PurchasingUserGroup {
  _id: String!
  name: String!
  description: String
  users: [PurchasingGroupMember]
}

extend type Query {
  purchasingUserGroups: [PurchasingUserGroup]
    @checkPermissions(permissions: [PURCHASING_MANAGE_PERMISSIONS])
}

extend type Mutation {
  createPurchasingUserGroup(name: String!, description: String): PurchasingUserGroup
    @checkPermissions(permissions: [PURCHASING_MANAGE_PERMISSIONS])

  updatePurchasingUserGroup(_id: String!, name: String!, description: String): PurchasingUserGroup
    @checkPermissions(permissions: [PURCHASING_MANAGE_PERMISSIONS])

  deletePurchasingUserGroup(_id: String!): Boolean
    @checkPermissions(permissions: [PURCHASING_MANAGE_PERMISSIONS])

  addPurchasingGroupMember(groupId: String!, karkunId: String!): Boolean
    @checkPermissions(permissions: [PURCHASING_MANAGE_PERMISSIONS])

  removePurchasingGroupMember(groupId: String!, userId: String!): Boolean
    @checkPermissions(permissions: [PURCHASING_MANAGE_PERMISSIONS])
}
`;
