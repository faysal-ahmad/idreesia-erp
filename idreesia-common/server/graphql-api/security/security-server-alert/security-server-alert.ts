import gql from 'graphql-tag';

export default gql`
  type SecurityServerAlertType {
    _id: String
    externalId: String
    profileId: String
    profileName: String
    profileIsTest: Boolean
    channelId: String
    channelName: String
    timestamp: String
    similarityScore: Float
    imageUrl: String
    review: String
    reviewedAt: String
    reviewUpdatedAt: String

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
    pagedSecurityServerAlerts(
      filter: SecurityServerAlertFilter
    ): PagedSecurityServerAlertType
      @checkPermissions(permissions: [SECURITY_VIEW_SECURITY_SERVER_DATA])

    securityServerAlertById(_id: String!): SecurityServerAlertType
      @checkPermissions(permissions: [SECURITY_VIEW_SECURITY_SERVER_DATA])
  }

  extend type Mutation {
    # review is CORRECT or FALSE_POSITIVE; null clears it.
    setSecurityServerAlertReview(
      _id: String!
      review: String
    ): SecurityServerAlertType
      @checkPermissions(permissions: [SECURITY_MANAGE_SECURITY_SERVER_DATA])
  }
`;
