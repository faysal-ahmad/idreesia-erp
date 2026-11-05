import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  InboxConversationQuery,
  InboxConversationQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const INBOX_CONVERSATION: TypedDocumentNode<
  InboxConversationQuery,
  InboxConversationQueryVariables
> = gql`
  query inboxConversation($roomId: String!) {
    inboxConversation(roomId: $roomId) {
      conversation {
        _id
        customerName
        mobileNumber
        startedAt
        assignedTo
        open
      }
      messages {
        _id
        roomId
        text
        sentAt
        senderType
        senderName
        attachments {
          kind
          title
          mimeType
          size
          url
        }
      }
    }
  }
`;

export default INBOX_CONVERSATION;
