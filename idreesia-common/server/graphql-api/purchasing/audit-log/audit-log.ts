import gql from 'graphql-tag';

export default gql`
input PurchasingAuditLogFilter {
  entityId: String
  # Limits the result to these document types (e.g. "purchasing-order").
  entityTypes: [String]
  # Milliseconds since the epoch, as a string.
  fromDate: String
  toDate: String
  pageIndex: String
  pageSize: String
}

extend type Query {
  pagedPurchasingAuditLogs(filter: PurchasingAuditLogFilter): PagedAuditLogType
    @checkPermissions(permissions: [PURCHASING_VIEW_AUDIT_LOGS])
}
`;
