import gql from 'graphql-tag';

export default gql`
type JobDefinitionType {
  _id: String
  name: String
  displayName: String
  defaultSchedule: String
  schedule: String
  enabled: Boolean
  createdAt: DateTime
  updatedAt: DateTime
}

extend type Query {
  allJobDefinitions: [JobDefinitionType]
    @checkPermissions(permissions: [ADMIN_VIEW_JOBS, ADMIN_MANAGE_JOBS])
}

extend type Mutation {
  updateJobDefinitionSchedule(_id: String!, schedule: String!): JobDefinitionType
    @checkPermissions(permissions: [ADMIN_MANAGE_JOBS])

  # Removes the recurring schedule entirely (not merely disabling it) -
  # the job goes back to manual-only, and its recurring job instance is
  # cancelled immediately.
  clearJobDefinitionSchedule(_id: String!): JobDefinitionType
    @checkPermissions(permissions: [ADMIN_MANAGE_JOBS])

  resetJobDefinitionSchedule(_id: String!): JobDefinitionType
    @checkPermissions(permissions: [ADMIN_MANAGE_JOBS])

  setJobDefinitionEnabled(_id: String!, enabled: Boolean!): JobDefinitionType
    @checkPermissions(permissions: [ADMIN_MANAGE_JOBS])
}
`;
