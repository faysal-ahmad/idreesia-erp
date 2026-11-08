import gql from 'graphql-tag';

// What the mobile discussion screens show of a message.
export const MOBILE_DISCUSSION_MESSAGE_FIELDS = gql`
  fragment MobileDiscussionMessageFields on DiscussionMessageType {
    _id
    text
    sentAt
    senderName
    senderId
    senderImageUrl
    senderImageThumbnailUrl
    isOwn
    isSystem
    attachments {
      kind
      title
      mimeType
      size
      url
    }
    editedAt
    isPinned
    isStarred
    reactions {
      emoji
      count
      reactedByMe
    }
    threadId
    showInMainList
    threadReplyCount
  }
`;
