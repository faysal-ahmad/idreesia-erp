import gql from 'graphql-tag';

/**
 * Everything the profile screens show. Every profile operation returns it, so
 * the cache updates the detail screen and the profile's row in the list.
 */
export const MOBILE_WORKSPACE_MONITORING_PROFILE_FIELDS = gql`
  fragment MobileWorkspaceMonitoringProfileFields on WorkspaceMonitoringProfileType {
    _id
    name
    isTest
    alertsCount
    photos {
      _id
      imageUrl
      thumbnailUrl
    }
  }
`;
