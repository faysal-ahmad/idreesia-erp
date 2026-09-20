import gql from 'graphql-tag';

export default gql`
type SecurityLogUserOption {
  _id: String!
  name: String!
}

extend type Query {
  pagedSecurityLogs(filter: SecurityLogFilter): PagedSecurityLogType
    @checkPermissions(permissions: [ADMIN_VIEW_SECURITY_LOGS])

  securityLogUsers(search: String, ids: [String!]): [SecurityLogUserOption!]!
    @checkPermissions(permissions: [ADMIN_VIEW_SECURITY_LOGS])
}
`;
