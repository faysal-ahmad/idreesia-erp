import gql from 'graphql-tag';

// Discussions in the Workspaces module. The message types are generic, so
// other places that host discussions can reuse them.
export default gql`
type DiscussionAttachmentType {
  kind: String
  title: String
  mimeType: String
  size: Int
  url: String
}

type DiscussionReactionType {
  emoji: String
  count: Int
  usernames: [String]
  reactedByMe: Boolean
}

type DiscussionMessageType {
  _id: String
  text: String
  sentAt: String
  senderName: String
  senderId: String
  senderImageId: String
  senderImageThumbnailId: String
  isOwn: Boolean
  isSystem: Boolean
  attachments: [DiscussionAttachmentType]
  editedAt: String
  isPinned: Boolean
  # Starred by the logged-in user.
  isStarred: Boolean
  reactions: [DiscussionReactionType]
  # On a thread reply: the parent message id.
  threadId: String
  # A thread reply that is also shown in the main list.
  showInMainList: Boolean
  threadReplyCount: Int
  threadLastReplyAt: String
}

type DiscussionSyncType {
  messages: [DiscussionMessageType]
  deletedIds: [String]
  # Pass back as 'since' on the next sync.
  syncedAt: String
  # Initial load only: older messages exist.
  hasOlder: Boolean
}

# A page of messages, oldest first.
type DiscussionMessagePageType {
  messages: [DiscussionMessageType]
  hasMore: Boolean
}

type DiscussionMemberType {
  # Chat username, used in @mentions.
  username: String
  name: String
  imageId: String
  imageThumbnailId: String
}

type DiscussionInfoType {
  canPost: Boolean
  # The logged-in user can pin/unpin messages (committee coordinators).
  canPin: Boolean
}

extend type Query {
  workspaceDiscussionInfo(committeeId: String!): DiscussionInfoType
  # Without 'since': the latest messages. With it: what changed since then.
  workspaceDiscussionSync(committeeId: String!, since: String): DiscussionSyncType
  # A thread: the parent message first, then its replies.
  workspaceDiscussionThreadMessages(
    committeeId: String!
    threadId: String!
  ): [DiscussionMessageType]
  workspaceDiscussionMembers(committeeId: String!): [DiscussionMemberType]
  workspaceDiscussionPinnedMessages(committeeId: String!): [DiscussionMessageType]
  # Messages starred by the logged-in user.
  workspaceDiscussionStarredMessages(committeeId: String!): [DiscussionMessageType]
  # Messages sent before 'before' (an ISO time), one page.
  workspaceDiscussionOlderMessages(
    committeeId: String!
    before: String!
  ): DiscussionMessagePageType
  # Messages matching the search (words or a /regex/), newest page first;
  # 'offset' is the number of matches already shown.
  workspaceDiscussionSearchMessages(
    committeeId: String!
    searchText: String!
    offset: Int
  ): DiscussionMessagePageType
}

extend type Mutation {
  workspaceSendDiscussionMessage(
    committeeId: String!
    text: String!
    threadId: String
  ): Boolean!
  workspaceReactToDiscussionMessage(
    committeeId: String!
    messageId: String!
    emoji: String!
    shouldReact: Boolean!
  ): Boolean!
  workspaceSetDiscussionMessageStarred(
    committeeId: String!
    messageId: String!
    starred: Boolean!
  ): Boolean!
  workspaceSetDiscussionMessagePinned(
    committeeId: String!
    messageId: String!
    pinned: Boolean!
  ): Boolean!
  workspaceEditDiscussionMessage(
    committeeId: String!
    messageId: String!
    text: String!
  ): Boolean!
  workspaceDeleteDiscussionMessage(
    committeeId: String!
    messageId: String!
  ): Boolean!
}
`;
