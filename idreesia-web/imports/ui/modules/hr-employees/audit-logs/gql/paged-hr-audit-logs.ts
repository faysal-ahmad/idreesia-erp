import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedHrEmployeesAuditLogsQuery,
  PagedHrEmployeesAuditLogsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PAGED_HR_AUDIT_LOGS: TypedDocumentNode<
  PagedHrEmployeesAuditLogsQuery,
  PagedHrEmployeesAuditLogsQueryVariables
> = gql`
  query pagedHrEmployeesAuditLogs($filter: AuditLogFilter) {
    pagedHrEmployeesAuditLogs(filter: $filter) {
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
