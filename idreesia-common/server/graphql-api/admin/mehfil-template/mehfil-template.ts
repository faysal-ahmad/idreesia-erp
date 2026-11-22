import gql from 'graphql-tag';

export default gql`
type MehfilDutyType {
  _id: String!
  name: String!
  description: String

  createdAt: String
  createdBy: String
  updatedAt: String
  updatedBy: String
}

extend type Query {
  allMehfilDuties: [MehfilDutyType]
    @checkPermissions(permissions: [ADMIN_VIEW_ORG_LOCATIONS])
}

extend type Mutation {
  createMehfilDuty(name: String!, description: String): MehfilDutyType
    @checkPermissions(permissions: [ADMIN_MANAGE_ORG_LOCATIONS])

  updateMehfilDuty(
    _id: String!
    name: String
    description: String
  ): MehfilDutyType @checkPermissions(permissions: [ADMIN_MANAGE_ORG_LOCATIONS])

  deleteMehfilDuty(_id: String!): Boolean
    @checkPermissions(permissions: [ADMIN_MANAGE_ORG_LOCATIONS])
}
`;
