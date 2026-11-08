import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  MobileWorkspaceDiscussionMembersQuery,
  MobileWorkspaceDiscussionMembersQueryVariables,
  MobileWorkspaceDiscussionPinnedMessagesQuery,
  MobileWorkspaceDiscussionPinnedMessagesQueryVariables,
  MobileWorkspaceDiscussionSearchMessagesQuery,
  MobileWorkspaceDiscussionSearchMessagesQueryVariables,
  MobileWorkspaceDiscussionStarredMessagesQuery,
  MobileWorkspaceDiscussionStarredMessagesQueryVariables,
  MobileWorkspaceDiscussionThreadMessagesQuery,
  MobileWorkspaceDiscussionThreadMessagesQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

import { MOBILE_DISCUSSION_MESSAGE_FIELDS } from './discussion-message-fields';

// A thread: the parent message first, then its replies.
export const MOBILE_WORKSPACE_DISCUSSION_THREAD_MESSAGES: TypedDocumentNode<
  MobileWorkspaceDiscussionThreadMessagesQuery,
  MobileWorkspaceDiscussionThreadMessagesQueryVariables
> = gql`
  query mobileWorkspaceDiscussionThreadMessages($committeeId: String!, $threadId: String!) {
    workspaceDiscussionThreadMessages(committeeId: $committeeId, threadId: $threadId) {
      ...MobileDiscussionMessageFields
    }
  }
  ${MOBILE_DISCUSSION_MESSAGE_FIELDS}
`;

// For @mention suggestions.
export const MOBILE_WORKSPACE_DISCUSSION_MEMBERS: TypedDocumentNode<
  MobileWorkspaceDiscussionMembersQuery,
  MobileWorkspaceDiscussionMembersQueryVariables
> = gql`
  query mobileWorkspaceDiscussionMembers($committeeId: String!) {
    workspaceDiscussionMembers(committeeId: $committeeId) {
      username
      name
      imageUrl
      imageThumbnailUrl
    }
  }
`;

export const MOBILE_WORKSPACE_DISCUSSION_PINNED_MESSAGES: TypedDocumentNode<
  MobileWorkspaceDiscussionPinnedMessagesQuery,
  MobileWorkspaceDiscussionPinnedMessagesQueryVariables
> = gql`
  query mobileWorkspaceDiscussionPinnedMessages($committeeId: String!) {
    workspaceDiscussionPinnedMessages(committeeId: $committeeId) {
      ...MobileDiscussionMessageFields
    }
  }
  ${MOBILE_DISCUSSION_MESSAGE_FIELDS}
`;

// Starred by the signed-in user.
export const MOBILE_WORKSPACE_DISCUSSION_STARRED_MESSAGES: TypedDocumentNode<
  MobileWorkspaceDiscussionStarredMessagesQuery,
  MobileWorkspaceDiscussionStarredMessagesQueryVariables
> = gql`
  query mobileWorkspaceDiscussionStarredMessages($committeeId: String!) {
    workspaceDiscussionStarredMessages(committeeId: $committeeId) {
      ...MobileDiscussionMessageFields
    }
  }
  ${MOBILE_DISCUSSION_MESSAGE_FIELDS}
`;

// Words or a /regex/; pages go back in time ('offset' = matches shown).
export const MOBILE_WORKSPACE_DISCUSSION_SEARCH_MESSAGES: TypedDocumentNode<
  MobileWorkspaceDiscussionSearchMessagesQuery,
  MobileWorkspaceDiscussionSearchMessagesQueryVariables
> = gql`
  query mobileWorkspaceDiscussionSearchMessages($committeeId: String!, $searchText: String!, $offset: Int) {
    workspaceDiscussionSearchMessages(committeeId: $committeeId, searchText: $searchText, offset: $offset) {
      messages {
        ...MobileDiscussionMessageFields
      }
      hasMore
    }
  }
  ${MOBILE_DISCUSSION_MESSAGE_FIELDS}
`;
