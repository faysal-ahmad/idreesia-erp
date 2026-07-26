import gql from 'graphql-tag';

const PAGED_SECURITY_AUDIT_LOGS = gql`
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
