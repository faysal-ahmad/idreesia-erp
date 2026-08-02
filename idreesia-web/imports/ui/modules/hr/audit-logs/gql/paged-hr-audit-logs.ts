import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedHrAuditLogsQuery,
  PagedHrAuditLogsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PAGED_HR_AUDIT_LOGS: TypedDocumentNode<
  PagedHrAuditLogsQuery,
  PagedHrAuditLogsQueryVariables
> = gql`
  query pagedHrAuditLogs($filter: AuditLogFilter) {
    pagedHrAuditLogs(filter: $filter) {
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
        operationByImageId
      }
    }
  }
`;

export default PAGED_HR_AUDIT_LOGS;
