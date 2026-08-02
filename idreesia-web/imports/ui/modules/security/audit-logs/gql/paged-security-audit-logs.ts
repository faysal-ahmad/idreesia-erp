import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedSecurityAuditLogsQuery,
  PagedSecurityAuditLogsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PAGED_SECURITY_AUDIT_LOGS: TypedDocumentNode<
  PagedSecurityAuditLogsQuery,
  PagedSecurityAuditLogsQueryVariables
> = gql`
  query pagedSecurityAuditLogs($filter: AuditLogFilter) {
    pagedSecurityAuditLogs(filter: $filter) {
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

export default PAGED_SECURITY_AUDIT_LOGS;
