import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedSecurityServerAlertGroupsQuery,
  PagedSecurityServerAlertGroupsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PAGED_SECURITY_SERVER_ALERT_GROUPS: TypedDocumentNode<
  PagedSecurityServerAlertGroupsQuery,
  PagedSecurityServerAlertGroupsQueryVariables
> = gql`
  query pagedSecurityServerAlertGroups($filter: SecurityServerAlertFilter) {
    pagedSecurityServerAlertGroups(filter: $filter) {
      totalResults
      data {
        profileId
        profileName
        profileIsTest
        alertCount
        notReviewedCount
        firstTimestamp
        lastTimestamp
        latestImageUrl
        latestThumbnailUrl
      }
    }
  }
`;

export default PAGED_SECURITY_SERVER_ALERT_GROUPS;
