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

type DiscussionMessageType {
  _id: String
  text: String
  sentAt: String
  senderName: String
  isOwn: Boolean
  isSystem: Boolean
  attachments: [DiscussionAttachmentType]
}

type DiscussionInfoType {
  canPost: Boolean
}

extend type Query {
  workspaceDiscussionInfo(committeeId: String!): DiscussionInfoType
  workspaceDiscussionMessages(committeeId: String!, after: String): [DiscussionMessageType]
}

extend type Mutation {
  workspaceSendDiscussionMessage(committeeId: String!, text: String!): Boolean!
}
`;
