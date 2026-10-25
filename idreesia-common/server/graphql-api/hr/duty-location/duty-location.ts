import gql from 'graphql-tag';

export default gql`
type DutyLocationType {
  _id: String
  dutyId: String
  name: String

  duty: DutyType
  canDelete: Boolean

  createdAt: String
  createdBy: String
  updatedAt: String
  updatedBy: String
}

extend type Query {
  allDutyLocations: [DutyLocationType]
  dutyLocationsByDutyId(dutyId: String!): [DutyLocationType]
  dutyLocationById(id: String!): DutyLocationType
}

extend type Mutation {
  createDutyLocation(name: String!, dutyId: String!): DutyLocationType
    @checkPermissions(permissions: [HR_MANAGE_SETUP_DATA])
  updateDutyLocation(id: String!, name: String!, dutyId: String!): DutyLocationType
    @checkPermissions(permissions: [HR_MANAGE_SETUP_DATA])
  removeDutyLocation(_id: String!): Int
    @checkPermissions(permissions: [HR_MANAGE_SETUP_DATA])
}
`;
