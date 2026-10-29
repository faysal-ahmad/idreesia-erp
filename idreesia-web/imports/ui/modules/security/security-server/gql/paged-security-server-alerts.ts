import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedSecurityServerAlertsQuery,
  PagedSecurityServerAlertsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PAGED_SECURITY_SERVER_ALERTS: TypedDocumentNode<
  PagedSecurityServerAlertsQuery,
  PagedSecurityServerAlertsQueryVariables
> = gql`
  query pagedSecurityServerAlerts($filter: SecurityServerAlertFilter) {
    pagedSecurityServerAlerts(filter: $filter) {
      totalResults
      data {
        _id
        profileId
        profileName
        profileIsTest
        channelId
        channelName
        timestamp
        similarityScore
        imageUrl
        thumbnailUrl
        review
      }
    }
  }
`;

export default PAGED_SECURITY_SERVER_ALERTS;
