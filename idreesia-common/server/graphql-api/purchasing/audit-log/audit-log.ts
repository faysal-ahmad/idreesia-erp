import gql from 'graphql-tag';

export default gql`
extend type Query {
  pagedPurchasingAuditLogs(filter: AuditLogFilter): PagedAuditLogType
    @checkPermissions(permissions: [PURCHASING_VIEW_AUDIT_LOGS])
}
`;
