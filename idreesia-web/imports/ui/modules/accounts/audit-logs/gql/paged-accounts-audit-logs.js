import gql from 'graphql-tag';

const PAGED_ACCOUNTS_AUDIT_LOGS = gql`
  query pagedAccountsAuditLogs($filter: AuditLogFilter) {
    pagedAccountsAuditLogs(filter: $filter) {
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

export default PAGED_ACCOUNTS_AUDIT_LOGS;
