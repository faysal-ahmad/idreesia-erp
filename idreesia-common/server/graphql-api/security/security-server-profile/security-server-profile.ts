import gql from 'graphql-tag';

export default gql`
type SecurityServerProfileImageType {
  externalId: String
  imageUrl: String
}

type SecurityServerProfileType {
  _id: String
  externalId: String
  name: String
  isTest: Boolean
  images: [SecurityServerProfileImageType]
  externalCreatedAt: String
  externalUpdatedAt: String

  alertsCount: Int

  createdAt: String
  createdBy: String
  updatedAt: String
  updatedBy: String
  deletedAt: String
}

type PagedSecurityServerProfileType {
  totalResults: Int
  data: [SecurityServerProfileType]
}

input SecurityServerProfileFilter {
  name: String
  includeTest: String
  includeDeleted: String
  pageIndex: String
  pageSize: String
}

extend type Query {
  pagedSecurityServerProfiles(filter: SecurityServerProfileFilter): PagedSecurityServerProfileType
  @checkPermissions(permissions: [SECURITY_VIEW_SECURITY_SERVER_DATA])

  securityServerProfileById(_id: String!): SecurityServerProfileType
  @checkPermissions(permissions: [SECURITY_VIEW_SECURITY_SERVER_DATA])
}
`;
