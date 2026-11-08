import gql from 'graphql-tag';

// Monitoring Profiles in the Workspaces module: the people the security
// server watches for, for committees with that feature. Access is based on
// committee membership, not on Security permissions, so only the fields the
// screens show are exposed, and only names, the test flag and photos can be
// changed (no creating or deleting profiles).
export default gql`
type WorkspaceMonitoringProfilePhotoType {
  _id: String
  imageUrl: String
  # Null for photos stored before thumbnails existed; use imageUrl then.
  thumbnailUrl: String
}

type WorkspaceMonitoringProfileType {
  _id: String
  name: String
  isTest: Boolean
  # The default photo first.
  photos: [WorkspaceMonitoringProfilePhotoType]
  alertsCount: Int
}

type PagedWorkspaceMonitoringProfileType {
  data: [WorkspaceMonitoringProfileType]
  totalResults: Int
}

extend type Query {
  # Profiles that aren't deleted, by name. 'name' matches part of the name.
  # Test profiles are included unless 'includeTest' is false.
  workspaceMonitoringProfiles(
    committeeId: String!
    name: String
    includeTest: Boolean
    pageIndex: String
    pageSize: String
  ): PagedWorkspaceMonitoringProfileType

  # Null when the profile doesn't exist or was deleted.
  workspaceMonitoringProfileById(
    committeeId: String!
    profileId: String!
  ): WorkspaceMonitoringProfileType
}

extend type Mutation {
  updateWorkspaceMonitoringProfile(
    committeeId: String!
    profileId: String!
    name: String!
    isTest: Boolean!
  ): WorkspaceMonitoringProfileType

  # imageData is base64, optionally as a data: URL. The photo is rejected
  # unless it has exactly one face the security server can use.
  addWorkspaceMonitoringProfilePhoto(
    committeeId: String!
    profileId: String!
    imageData: String!
  ): WorkspaceMonitoringProfileType

  removeWorkspaceMonitoringProfilePhoto(
    committeeId: String!
    profileId: String!
    photoId: String!
  ): WorkspaceMonitoringProfileType
}
`;
