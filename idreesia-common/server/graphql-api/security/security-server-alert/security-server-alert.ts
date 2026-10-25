import gql from 'graphql-tag';

export default gql`
type SecurityServerAlertType {
  _id: String
  externalId: String
  profileId: String
  profileExternalId: String
  profileName: String
  profileIsTest: Boolean
  channelId: String
  channelExternalId: String
  channelName: String
  timestamp: String
  similarityScore: Float
  imageUrl: String
  review: String
  reviewedAt: String

  createdAt: String
  createdBy: String
  updatedAt: String
  updatedBy: String
}

type PagedSecurityServerAlertType {
  totalResults: Int
  data: [SecurityServerAlertType]
}

input SecurityServerAlertFilter {
  profileId: String
  channelId: String
  review: String
  startDate: String
  endDate: String
  includeTest: String
  pageIndex: String
  pageSize: String
}

extend type Query {
  pagedSecurityServerAlerts(filter: SecurityServerAlertFilter): PagedSecurityServerAlertType
  @checkPermissions(permissions: [SECURITY_VIEW_SECURITY_SERVER_DATA])

  securityServerAlertById(_id: String!): SecurityServerAlertType
  @checkPermissions(permissions: [SECURITY_VIEW_SECURITY_SERVER_DATA])
}
`;
