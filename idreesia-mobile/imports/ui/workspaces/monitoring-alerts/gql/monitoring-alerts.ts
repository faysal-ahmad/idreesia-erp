import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  MobileWorkspaceMonitoringAlertsQuery,
  MobileWorkspaceMonitoringAlertsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

/** Rows of the Monitoring Alerts screen (monitoring-alerts-screen.tsx). */
export const MOBILE_WORKSPACE_MONITORING_ALERTS: TypedDocumentNode<
  MobileWorkspaceMonitoringAlertsQuery,
  MobileWorkspaceMonitoringAlertsQueryVariables
> = gql`
  query mobileWorkspaceMonitoringAlerts(
    $committeeId: String!
    $date: String!
    $includeTest: Boolean
    $pageIndex: String
    $pageSize: String
  ) {
    workspaceMonitoringAlerts(
      committeeId: $committeeId
      date: $date
      includeTest: $includeTest
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
        imageUrl
        thumbnailUrl
      }
    }
  }
`;
