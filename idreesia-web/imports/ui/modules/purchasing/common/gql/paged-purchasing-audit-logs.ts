import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedPurchasingAuditLogsQuery,
  PagedPurchasingAuditLogsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PAGED_PURCHASING_AUDIT_LOGS: TypedDocumentNode<
  PagedPurchasingAuditLogsQuery,
  PagedPurchasingAuditLogsQueryVariables
> = gql`
  query pagedPurchasingAuditLogs($filter: AuditLogFilter) {
    pagedPurchasingAuditLogs(filter: $filter) {
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

export default PAGED_PURCHASING_AUDIT_LOGS;
