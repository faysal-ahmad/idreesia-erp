import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';

import type {
  WorkspaceMonitoringAlertsQuery,
  WorkspaceMonitoringAlertsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const WORKSPACE_MONITORING_ALERTS: TypedDocumentNode<
  WorkspaceMonitoringAlertsQuery,
  WorkspaceMonitoringAlertsQueryVariables
> = gql`
  query workspaceMonitoringAlerts(
    $committeeId: String!
    $date: String!
    $pageIndex: String
    $pageSize: String
  ) {
    workspaceMonitoringAlerts(
      committeeId: $committeeId
      date: $date
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      totalResults
      data {
        _id
        timestamp
        profileName
        profileIsTest
        channelName
        similarityScore
        review
        imageUrl
        thumbnailUrl
      }
    }
  }
`;
