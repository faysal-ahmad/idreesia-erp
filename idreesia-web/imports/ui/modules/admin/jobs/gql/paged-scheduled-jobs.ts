import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedScheduledJobsQuery,
  PagedScheduledJobsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PAGED_SCHEDULED_JOBS: TypedDocumentNode<
  PagedScheduledJobsQuery,
  PagedScheduledJobsQueryVariables
> = gql`
  query pagedScheduledJobs($filter: ScheduledJobsFilterType) {
    pagedScheduledJobs(filter: $filter) {
      totalResults
      data {
        _id
        name
        status
        nextRunAt
        lastRunAt
        lastFinishedAt
        failedAt
        failReason
        failCount
        repeatInterval
        disabled
      }
    }
  }
`;

export default PAGED_SCHEDULED_JOBS;
