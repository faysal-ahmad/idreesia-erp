import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedJobLogsQuery,
  PagedJobLogsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PAGED_JOB_LOGS: TypedDocumentNode<
  PagedJobLogsQuery,
  PagedJobLogsQueryVariables
> = gql`
  query pagedJobLogs($filter: JobLogsFilterType) {
    pagedJobLogs(filter: $filter) {
      totalResults
      data {
        _id
        timestamp
        level
        event
        jobId
        jobName
        message
        duration
        error
        failCount
        retryDelay
        retryAttempt
      }
    }
  }
`;

export default PAGED_JOB_LOGS;
