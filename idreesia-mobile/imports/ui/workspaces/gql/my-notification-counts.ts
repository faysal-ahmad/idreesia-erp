import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  MobileMyNotificationCountsQuery,
  MobileMyNotificationCountsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

// Unread notification counts per committee and module: all the Workspaces tab
// needs. The notifications themselves are listed per module, later.
export const MOBILE_MY_NOTIFICATION_COUNTS: TypedDocumentNode<
  MobileMyNotificationCountsQuery,
  MobileMyNotificationCountsQueryVariables
> = gql`
  query mobileMyNotificationCounts {
    myNotificationCounts {
      committeeId
      module
      unreadCount
    }
  }
`;
