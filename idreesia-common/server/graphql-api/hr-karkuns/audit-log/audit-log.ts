import gql from 'graphql-tag';

export default gql`
extend type Query {
  pagedHrKarkunsAuditLogs(filter: AuditLogFilter): PagedAuditLogType
    @checkPermissions(permissions: [HR_KARKUNS_VIEW_AUDIT_LOGS])
}
`;
