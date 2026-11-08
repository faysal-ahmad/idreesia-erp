import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  MobileWorkspaceMonitoringProfilesQuery,
  MobileWorkspaceMonitoringProfilesQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

import { MOBILE_WORKSPACE_MONITORING_PROFILE_FIELDS } from './monitoring-profile-fields';

/** Rows of the Monitoring Profiles screen (monitoring-profiles-screen.tsx). */
export const MOBILE_WORKSPACE_MONITORING_PROFILES: TypedDocumentNode<
  MobileWorkspaceMonitoringProfilesQuery,
  MobileWorkspaceMonitoringProfilesQueryVariables
> = gql`
  query mobileWorkspaceMonitoringProfiles(
    $committeeId: String!
    $name: String
    $includeTest: Boolean
    $pageIndex: String
    $pageSize: String
  ) {
    workspaceMonitoringProfiles(
      committeeId: $committeeId
      name: $name
      includeTest: $includeTest
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      totalResults
      data {
        ...MobileWorkspaceMonitoringProfileFields
      }
    }
  }
  ${MOBILE_WORKSPACE_MONITORING_PROFILE_FIELDS}
`;
