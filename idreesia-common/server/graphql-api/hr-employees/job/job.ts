import gql from 'graphql-tag';

export default gql`
type JobType {
  _id: String
  name: String
  description: String

  usedCount: Int
  shifts: [JobShiftType]

  createdAt: String
  createdBy: String
  updatedAt: String
  updatedBy: String
}

extend type Query {
  allJobs: [JobType]
    @checkPermissions(permissions: [HR_VIEW_EMPLOYEES, HR_MANAGE_EMPLOYEES, HR_MANAGE_EMPLOYEES_SETUP_DATA])
  jobById(id: String!): JobType
    @checkPermissions(permissions: [HR_VIEW_EMPLOYEES, HR_MANAGE_EMPLOYEES, HR_MANAGE_EMPLOYEES_SETUP_DATA])
}

extend type Mutation {
  createJob(name: String!, description: String): JobType
    @checkPermissions(permissions: [HR_MANAGE_EMPLOYEES_SETUP_DATA])
  updateJob(id: String!, name: String!, description: String): JobType
    @checkPermissions(permissions: [HR_MANAGE_EMPLOYEES_SETUP_DATA])
  removeJob(_id: String!): Int
    @checkPermissions(permissions: [HR_MANAGE_EMPLOYEES_SETUP_DATA])
}
`;
