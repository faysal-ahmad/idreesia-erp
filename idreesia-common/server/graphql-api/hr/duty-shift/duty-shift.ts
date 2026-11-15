import gql from 'graphql-tag';

export default gql`
type DutyShiftType {
  _id: String
  dutyId: String
  name: String
  startTime: String
  endTime: String

  duty: DutyType
  canDelete: Boolean

  createdAt: String
  createdBy: String
  updatedAt: String
  updatedBy: String
}

extend type Query {
  allDutyShifts: [DutyShiftType]
    @checkPermissions(permissions: [HR_VIEW_KARKUNS, HR_MANAGE_KARKUNS, HR_MANAGE_KARKUNS_SETUP_DATA])
}

extend type Mutation {
  createDutyShift(
    name: String!
    dutyId: String!
    startTime: String
    endTime: String
  ): DutyShiftType
    @checkPermissions(permissions: [HR_MANAGE_KARKUNS_SETUP_DATA])
  updateDutyShift(
    _id: String!
    name: String!
    dutyId: String!
    startTime: String
    endTime: String
  ): DutyShiftType
    @checkPermissions(permissions: [HR_MANAGE_KARKUNS_SETUP_DATA])
  removeDutyShift(_id: String!): Int
    @checkPermissions(permissions: [HR_MANAGE_KARKUNS_SETUP_DATA])
}
`;
