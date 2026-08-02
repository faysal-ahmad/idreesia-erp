import gql from 'graphql-tag';

export default gql`
extend type Query {
  pagedSecurityAuditLogs(filter: AuditLogFilter): PagedAuditLogType
  @checkPermissions(permissions: [SECURITY_VIEW_AUDIT_LOGS])
}
`;
