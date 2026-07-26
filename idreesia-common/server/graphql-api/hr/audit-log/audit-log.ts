// @ts-nocheck
import gql from 'graphql-tag';

export default gql`
extend type Query {
  pagedHrAuditLogs(filter: AuditLogFilter): PagedAuditLogType
}
`;
