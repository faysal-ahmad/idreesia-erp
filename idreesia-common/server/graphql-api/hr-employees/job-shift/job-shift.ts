import gql from 'graphql-tag';

export default gql`
type JobShiftType {
  _id: String
  jobId: String
  name: String
  startTime: String
  endTime: String

  # Employees currently on this shift; a shift in use can't be deleted.
  usedCount: Int

  createdAt: String
  createdBy: String
  updatedAt: String
  updatedBy: String
}

extend type Mutation {
  createJobShift(
    jobId: String!
    name: String!
    startTime: String
    endTime: String
  ): JobShiftType
    @checkPermissions(permissions: [HR_MANAGE_EMPLOYEES_SETUP_DATA])
  updateJobShift(
    _id: String!
    name: String!
    startTime: String
    endTime: String
  ): JobShiftType
    @checkPermissions(permissions: [HR_MANAGE_EMPLOYEES_SETUP_DATA])
  removeJobShift(_id: String!): Int
    @checkPermissions(permissions: [HR_MANAGE_EMPLOYEES_SETUP_DATA])
}
`;
