import gql from 'graphql-tag';

export default gql`
type DutyType {
  _id: String
  name: String
  isMehfilDuty: Boolean
  description: String
  committeeId: String

  committee: CommitteeType
  usedCount: Int
  shifts: [DutyShiftType]
  locations: [DutyLocationType]
  canDelete: Boolean

  createdAt: String
  createdBy: String
  updatedAt: String
  updatedBy: String
}

extend type Query {
  allMSDuties: [DutyType]
  allMehfilDuties: [DutyType]
}

extend type Mutation {
  createDuty(name: String!, isMehfilDuty: Boolean!, description: String, committeeId: String): DutyType
    @checkPermissions(permissions: [HR_MANAGE_SETUP_DATA])
  updateDuty(id: String!, name: String!, description: String, committeeId: String): DutyType
    @checkPermissions(permissions: [HR_MANAGE_SETUP_DATA])
  removeDuty(_id: String!): Int
    @checkPermissions(permissions: [HR_MANAGE_SETUP_DATA])
}
`;
