import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';

import type {
  WorkspaceMonitoringProfilesQuery,
  WorkspaceMonitoringProfilesQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const WORKSPACE_MONITORING_PROFILES: TypedDocumentNode<
  WorkspaceMonitoringProfilesQuery,
  WorkspaceMonitoringProfilesQueryVariables
> = gql`
  query workspaceMonitoringProfiles(
    $committeeId: String!
    $pageIndex: String
    $pageSize: String
  ) {
    workspaceMonitoringProfiles(
      committeeId: $committeeId
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      totalResults
      data {
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
    }
  }
`;
