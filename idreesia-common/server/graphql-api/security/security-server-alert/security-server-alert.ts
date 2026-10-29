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
    thumbnailUrl: String
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

  # The filtered alerts of one profile, rolled up.
  type SecurityServerAlertGroupType {
    profileId: String
    profileName: String
    profileIsTest: Boolean
    alertCount: Int
    notReviewedCount: Int
    firstTimestamp: String
    lastTimestamp: String
    latestImageUrl: String
    latestThumbnailUrl: String
  }

  type PagedSecurityServerAlertGroupType {
    totalResults: Int
    data: [SecurityServerAlertGroupType]
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

    pagedSecurityServerAlertGroups(
      filter: SecurityServerAlertFilter
    ): PagedSecurityServerAlertGroupType
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

    # Returns how many thumbnails were created.
    createMissingSecurityServerAlertThumbnails: Int
      @checkPermissions(permissions: [SECURITY_MANAGE_SECURITY_SERVER_DATA])
  }
`;
