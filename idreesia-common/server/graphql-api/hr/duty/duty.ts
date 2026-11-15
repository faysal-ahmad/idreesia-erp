import gql from 'graphql-tag';

export default gql`
type DutyType {
  _id: String
  name: String
  isMehfilDuty: Boolean
  description: String
  committeeId: String

  committee: CommitteeBasicType
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
    @checkPermissions(permissions: [HR_VIEW_KARKUNS, HR_MANAGE_KARKUNS, HR_MANAGE_KARKUNS_SETUP_DATA])
}

extend type Mutation {
  createDuty(name: String!, isMehfilDuty: Boolean!, description: String, committeeId: String): DutyType
    @checkPermissions(permissions: [HR_MANAGE_KARKUNS_SETUP_DATA])
  updateDuty(id: String!, name: String!, description: String, committeeId: String): DutyType
    @checkPermissions(permissions: [HR_MANAGE_KARKUNS_SETUP_DATA])
  removeDuty(_id: String!): Int
    @checkPermissions(permissions: [HR_MANAGE_KARKUNS_SETUP_DATA])
}
`;
