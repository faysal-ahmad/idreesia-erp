import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedInboxConversationsQuery,
  PagedInboxConversationsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PAGED_INBOX_CONVERSATIONS: TypedDocumentNode<
  PagedInboxConversationsQuery,
  PagedInboxConversationsQueryVariables
> = gql`
  query pagedInboxConversations($filter: InboxConversationFilter) {
    pagedInboxConversations(filter: $filter) {
      totalResults
      data {
        _id
        mobileNumber
        lastMessageAt
      }
    }
  }
`;

export default PAGED_INBOX_CONVERSATIONS;
