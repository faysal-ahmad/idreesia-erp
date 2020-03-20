import gql from 'graphql-tag';

const PAGED_OUTSTATION_AUDIT_LOGS = gql`
  query pagedOutstationAuditLogs($filter: AuditLogFilter) {
    pagedOutstationAuditLogs(filter: $filter) {
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

export default PAGED_OUTSTATION_AUDIT_LOGS;
