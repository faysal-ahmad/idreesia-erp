import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedSecurityLogsQuery,
  PagedSecurityLogsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PAGED_SECURITY_LOGS: TypedDocumentNode<
  PagedSecurityLogsQuery,
  PagedSecurityLogsQueryVariables
> = gql`
  query pagedSecurityLogs($filter: SecurityLogFilter) {
    pagedSecurityLogs(filter: $filter) {
      totalResults
      data {
        _id
        userId
        operationType
        operationDetails
        operationTime
        operationBy
        dataSource
        dataSourceDetail
        userName
        userImageId
        userImageThumbnailId
        operationByName
        operationByImageId
        operationByImageThumbnailId
      }
    }
  }
`;

export default PAGED_SECURITY_LOGS;
