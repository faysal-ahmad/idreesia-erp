import gql from 'graphql-tag';

export default gql`
extend type Query {
  pagedHrEmployeesAuditLogs(filter: AuditLogFilter): PagedAuditLogType
    @checkPermissions(permissions: [HR_EMPLOYEES_VIEW_AUDIT_LOGS])
}
`;
