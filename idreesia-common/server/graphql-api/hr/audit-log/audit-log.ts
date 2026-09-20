import gql from 'graphql-tag';

export default gql`
extend type Query {
  pagedHrAuditLogs(filter: AuditLogFilter): PagedAuditLogType
    @checkPermissions(permissions: [HR_VIEW_AUDIT_LOGS])
}
`;
