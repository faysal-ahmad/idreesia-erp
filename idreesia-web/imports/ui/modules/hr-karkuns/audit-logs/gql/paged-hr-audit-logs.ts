import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedHrKarkunsAuditLogsQuery,
  PagedHrKarkunsAuditLogsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PAGED_HR_AUDIT_LOGS: TypedDocumentNode<
  PagedHrKarkunsAuditLogsQuery,
  PagedHrKarkunsAuditLogsQueryVariables
> = gql`
  query pagedHrKarkunsAuditLogs($filter: AuditLogFilter) {
    pagedHrKarkunsAuditLogs(filter: $filter) {
      totalResults
      data {
        _id
        entityId
        entityType
        operationType
        auditValues
        operationTime
        operationBy
        operationByName
        operationByImageUrl
        operationByImageThumbnailUrl
      }
    }
  }
`;

export default PAGED_HR_AUDIT_LOGS;
