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
  senderImageUrl: String
  senderImageThumbnailUrl: String
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
  imageUrl: String
  imageThumbnailUrl: String
}

type DiscussionInfoType {
  canPost: Boolean
  # The logged-in user can pin/unpin messages (committee coordinators).
  canPin: Boolean
}

extend type Query {
  workspaceDiscussionInfo(committeeId: String!): DiscussionInfoType
    @checkCommitteeAccess(roles: [COORDINATOR, MEMBER, OBSERVER])
  # Without 'since': the latest messages. With it: what changed since then.
  workspaceDiscussionSync(committeeId: String!, since: String): DiscussionSyncType
    @checkCommitteeAccess(roles: [COORDINATOR, MEMBER, OBSERVER])
  # A thread: the parent message first, then its replies.
  workspaceDiscussionThreadMessages(
    committeeId: String!
    threadId: String!
  ): [DiscussionMessageType]
    @checkCommitteeAccess(roles: [COORDINATOR, MEMBER, OBSERVER])
  workspaceDiscussionMembers(committeeId: String!): [DiscussionMemberType]
    @checkCommitteeAccess(roles: [COORDINATOR, MEMBER, OBSERVER])
  workspaceDiscussionPinnedMessages(committeeId: String!): [DiscussionMessageType]
    @checkCommitteeAccess(roles: [COORDINATOR, MEMBER, OBSERVER])
  # Messages starred by the logged-in user.
  workspaceDiscussionStarredMessages(committeeId: String!): [DiscussionMessageType]
    @checkCommitteeAccess(roles: [COORDINATOR, MEMBER, OBSERVER])
  # Messages sent before 'before' (an ISO time), one page.
  workspaceDiscussionOlderMessages(
    committeeId: String!
    before: String!
  ): DiscussionMessagePageType
    @checkCommitteeAccess(roles: [COORDINATOR, MEMBER, OBSERVER])
  # Messages matching the search (words or a /regex/), newest page first;
  # 'offset' is the number of matches already shown.
  workspaceDiscussionSearchMessages(
    committeeId: String!
    searchText: String!
    offset: Int
  ): DiscussionMessagePageType
    @checkCommitteeAccess(roles: [COORDINATOR, MEMBER, OBSERVER])
}

extend type Mutation {
  workspaceSendDiscussionMessage(
    committeeId: String!
    text: String!
    threadId: String
  ): Boolean!
    @checkCommitteeAccess(roles: [COORDINATOR, MEMBER])
  workspaceReactToDiscussionMessage(
    committeeId: String!
    messageId: String!
    emoji: String!
    shouldReact: Boolean!
  ): Boolean!
    @checkCommitteeAccess(roles: [COORDINATOR, MEMBER])
  workspaceSetDiscussionMessageStarred(
    committeeId: String!
    messageId: String!
    starred: Boolean!
  ): Boolean!
    @checkCommitteeAccess(roles: [COORDINATOR, MEMBER])
  workspaceSetDiscussionMessagePinned(
    committeeId: String!
    messageId: String!
    pinned: Boolean!
  ): Boolean!
    @checkCommitteeAccess(roles: [COORDINATOR])
  workspaceEditDiscussionMessage(
    committeeId: String!
    messageId: String!
    text: String!
  ): Boolean!
    @checkCommitteeAccess(roles: [COORDINATOR, MEMBER])
  workspaceDeleteDiscussionMessage(
    committeeId: String!
    messageId: String!
  ): Boolean!
    @checkCommitteeAccess(roles: [COORDINATOR, MEMBER])
}
`;
