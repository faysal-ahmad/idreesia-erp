import gql from 'graphql-tag';

export default gql`
  type SecurityServerProfileImageType {
    _id: String
    imageUrl: String
    # Null for photos stored before thumbnails existed; use imageUrl then.
    thumbnailUrl: String
    uploadedAt: String
  }

  type SecurityServerProfileType {
    _id: String
    name: String
    isTest: Boolean
    images: [SecurityServerProfileImageType]
    # The photo shown for the profile: the chosen default, or the oldest
    # photo when none was chosen. Null with no photos.
    defaultImageId: String

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
    pagedSecurityServerProfiles(
      filter: SecurityServerProfileFilter
    ): PagedSecurityServerProfileType
      @checkPermissions(permissions: [SECURITY_VIEW_SECURITY_SERVER_DATA])

    securityServerProfileById(_id: String!): SecurityServerProfileType
      @checkPermissions(permissions: [SECURITY_VIEW_SECURITY_SERVER_DATA])
  }

  extend type Mutation {
    createSecurityServerProfile(
      name: String!
      isTest: Boolean!
    ): SecurityServerProfileType
      @checkPermissions(permissions: [SECURITY_MANAGE_SECURITY_SERVER_DATA])

    updateSecurityServerProfile(
      _id: String!
      name: String!
      isTest: Boolean!
    ): SecurityServerProfileType
      @checkPermissions(permissions: [SECURITY_MANAGE_SECURITY_SERVER_DATA])

    deleteSecurityServerProfile(_id: String!): Int
      @checkPermissions(permissions: [SECURITY_MANAGE_SECURITY_SERVER_DATA])

    # imageData is base64, optionally as a data: URL. The image is rejected
    # unless it has exactly one face the security server can use.
    addSecurityServerProfileImage(
      profileId: String!
      imageData: String!
    ): SecurityServerProfileType
      @checkPermissions(permissions: [SECURITY_MANAGE_SECURITY_SERVER_DATA])

    removeSecurityServerProfileImage(
      profileId: String!
      imageId: String!
    ): SecurityServerProfileType
      @checkPermissions(permissions: [SECURITY_MANAGE_SECURITY_SERVER_DATA])

    setSecurityServerProfileDefaultImage(
      profileId: String!
      imageId: String!
    ): SecurityServerProfileType
      @checkPermissions(permissions: [SECURITY_MANAGE_SECURITY_SERVER_DATA])

    # Returns how many thumbnails were created.
    createMissingSecurityServerProfileThumbnails: Int
      @checkPermissions(permissions: [SECURITY_MANAGE_SECURITY_SERVER_DATA])
  }
`;
