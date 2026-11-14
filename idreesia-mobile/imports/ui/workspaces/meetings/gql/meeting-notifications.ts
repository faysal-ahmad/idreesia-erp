import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  MobileCommitteeMeetingNotificationsQuery,
  MobileCommitteeMeetingNotificationsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

// The committee's meeting notifications for the signed-in user, newest first.
export const MOBILE_COMMITTEE_MEETING_NOTIFICATIONS: TypedDocumentNode<
  MobileCommitteeMeetingNotificationsQuery,
  MobileCommitteeMeetingNotificationsQueryVariables
> = gql`
  query mobileCommitteeMeetingNotifications($committeeId: String!, $limit: Int!, $offset: Int) {
    myNotifications(committeeId: $committeeId, module: "meetings", limit: $limit, offset: $offset) {
      _id
      entityId
      eventType
      eventDetails
      createdAt
      isRead
    }
  }
`;
