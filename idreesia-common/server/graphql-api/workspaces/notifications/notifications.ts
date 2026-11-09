import gql from 'graphql-tag';

// The logged-in user's notifications from the headless modules (documents,
// discussions, members, ...). Which ones they see follows their committee membership.
export default gql`
type NotificationType {
  _id: String
  module: String
  # The committee the notification belongs to.
  committeeId: String
  entityType: String
  entityId: String
  eventType: String
  eventDetails: String
  createdAt: String
  updatedAt: String
  # Absent when the notification is for everyone in the workspace.
  recipientUserId: String
  actorUserId: String
  # The module's structured details, as JSON.
  data: String
  isRead: Boolean
}

# Unread notifications in one module of one committee.
type NotificationCountType {
  committeeId: String
  module: String
  unreadCount: Int
}

extend type Query {
  # Most recently changed first. 'limit' defaults to 100; 'offset' skips that
  # many (for loading more). 'committeeId' and 'module' narrow it to one
  # committee's / one module's notifications.
  myNotifications(
    limit: Int
    offset: Int
    committeeId: String
    module: String
  ): [NotificationType]
  # Only the unread counts, one row per committee and module that has any.
  myNotificationCounts: [NotificationCountType]
  myUnreadNotificationCount: Int
}

extend type Mutation {
  markNotificationsRead(ids: [String]!): Boolean!
}
`;
