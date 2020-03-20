import gql from 'graphql-tag';

const PAGED_HR_AUDIT_LOGS = gql`
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
