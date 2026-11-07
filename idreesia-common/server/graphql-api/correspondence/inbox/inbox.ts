import gql from 'graphql-tag';

// Inbox data lives in Rocket.Chat (Omnichannel). These types are read from
// and written to its REST API by the ERP server - nothing is stored in Mongo.
export default gql`
  type InboxAttachmentType {
    # image | audio | video | file
    kind: String
    title: String
    mimeType: String
    size: Float
    # ERP media proxy path (/api/correspondence/files/...). Needs the Meteor
    # login token in the Authorization header.
    url: String
  }

  type InboxMessageType {
    _id: String
    roomId: String
    text: String
    sentAt: String
    # visitor | agent | system
    senderType: String
    senderName: String
    attachments: [InboxAttachmentType]
  }

  type InboxConversationType {
    # The customer's open Rocket.Chat room
    _id: String
    visitorId: String
    customerName: String
    mobileNumber: String
    startedAt: String
    lastMessageAt: String
    lastMessage: InboxMessageType
    waitingResponse: Boolean
    assignedTo: String
    open: Boolean
  }

  type PagedInboxConversationType {
    totalResults: Int
    data: [InboxConversationType]
  }

  type InboxConversationDetailType {
    conversation: InboxConversationType
    # Every message across all of the customer's rooms, oldest first
    messages: [InboxMessageType]
  }

  input InboxConversationFilter {
    searchText: String
    pageIndex: String
    pageSize: String
  }

  extend type Query {
    pagedInboxConversations(
      filter: InboxConversationFilter
    ): PagedInboxConversationType
      @checkPermissions(permissions: [CORRESPONDENCE_INBOX_VIEW_MESSAGES])

    inboxConversation(roomId: String!): InboxConversationDetailType
      @checkPermissions(permissions: [CORRESPONDENCE_INBOX_VIEW_MESSAGES])
  }

  extend type Mutation {
    sendInboxMessage(roomId: String!, text: String!): InboxMessageType
      @checkPermissions(permissions: [CORRESPONDENCE_INBOX_REPLY_TO_MESSAGES])
  }
`;
