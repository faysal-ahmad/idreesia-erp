import gql from 'graphql-tag';

const PAGED_PORTAL_AUDIT_LOGS = gql`
  query pagedPortalAuditLogs($portalId: String!, $filter: AuditLogFilter) {
    pagedPortalAuditLogs(portalId: $portalId, filter: $filter) {
      totalResults
      data {
        _id
        entityId
        entityType
        operationType
        auditValues
        operationTime
        operationBy
      }
    }
  }
`;

export default PAGED_PORTAL_AUDIT_LOGS;
