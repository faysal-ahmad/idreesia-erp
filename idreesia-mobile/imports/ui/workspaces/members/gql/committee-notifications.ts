import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  MobileCommitteeMemberNotificationsQuery,
  MobileCommitteeMemberNotificationsQueryVariables,
  MobileMarkNotificationsReadMutation,
  MobileMarkNotificationsReadMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

// The committee's membership notifications for the signed-in user, newest first.
export const MOBILE_COMMITTEE_MEMBER_NOTIFICATIONS: TypedDocumentNode<
  MobileCommitteeMemberNotificationsQuery,
  MobileCommitteeMemberNotificationsQueryVariables
> = gql`
  query mobileCommitteeMemberNotifications($committeeId: String!, $limit: Int!, $offset: Int) {
    myNotifications(committeeId: $committeeId, module: "members", limit: $limit, offset: $offset) {
      _id
      eventType
      eventDetails
      createdAt
      isRead
    }
  }
`;

export const MOBILE_MARK_NOTIFICATIONS_READ: TypedDocumentNode<
  MobileMarkNotificationsReadMutation,
  MobileMarkNotificationsReadMutationVariables
> = gql`
  mutation mobileMarkNotificationsRead($ids: [String]!) {
    markNotificationsRead(ids: $ids)
  }
`;
