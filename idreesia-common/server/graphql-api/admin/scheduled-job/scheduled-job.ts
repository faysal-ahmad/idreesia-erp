import gql from 'graphql-tag';

export default gql`
type ScheduledJobType {
  _id: String
  name: String
  status: String
  progress: Int
  nextRunAt: DateTime
  lastRunAt: DateTime
  lastFinishedAt: DateTime
  failedAt: DateTime
  failReason: String
  failCount: Int
  repeatInterval: String
  disabled: Boolean
}

type PagedScheduledJobsType {
  totalResults: Int
  data: [ScheduledJobType]
}

input ScheduledJobsFilterType {
  name: String
  status: String
  pageIndex: String
  pageSize: String
}

type JobLogEntryType {
  _id: String
  timestamp: DateTime
  level: String
  event: String
  jobId: String
  jobName: String
  message: String
  duration: Int
  error: String
  failCount: Int
  retryDelay: Int
  retryAttempt: Int
}

type PagedJobLogsType {
  totalResults: Int
  data: [JobLogEntryType]
}

input JobLogsFilterType {
  jobName: String
  level: String
  event: String
  pageIndex: String
  pageSize: String
}

extend type Query {
  pagedScheduledJobs(filter: ScheduledJobsFilterType): PagedScheduledJobsType
    @checkPermissions(permissions: [ADMIN_VIEW_JOBS, ADMIN_MANAGE_JOBS])

  pagedJobLogs(filter: JobLogsFilterType): PagedJobLogsType
    @checkPermissions(permissions: [ADMIN_VIEW_JOBS, ADMIN_MANAGE_JOBS])

  # False when Meteor.settings.private.jobs.enabled is off (or the server
  # hasn't finished starting up yet) - queued/scheduled jobs will never run
  # while this is false, even though they can still be created.
  isJobProcessorActive: Boolean
    @checkPermissions(permissions: [ADMIN_VIEW_JOBS, ADMIN_MANAGE_JOBS])
}

extend type Mutation {
  runScheduledJobNow(name: String!): Boolean
    @checkPermissions(permissions: [ADMIN_MANAGE_JOBS])

  retryFailedJob(_id: String!): Boolean
    @checkPermissions(permissions: [ADMIN_MANAGE_JOBS])

  setScheduledJobEnabled(_id: String!, enabled: Boolean!): Boolean
    @checkPermissions(permissions: [ADMIN_MANAGE_JOBS])
}
`;
