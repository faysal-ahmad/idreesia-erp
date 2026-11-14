import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';

import type {
  WorkspaceDeleteDiscussionMessageMutation,
  WorkspaceDeleteDiscussionMessageMutationVariables,
  WorkspaceDiscussionInfoQuery,
  WorkspaceDiscussionInfoQueryVariables,
  WorkspaceDiscussionMembersQuery,
  WorkspaceDiscussionMembersQueryVariables,
  WorkspaceDiscussionOlderMessagesQuery,
  WorkspaceDiscussionOlderMessagesQueryVariables,
  WorkspaceDiscussionPinnedMessagesQuery,
  WorkspaceDiscussionPinnedMessagesQueryVariables,
  WorkspaceDiscussionSearchMessagesQuery,
  WorkspaceDiscussionSearchMessagesQueryVariables,
  WorkspaceDiscussionStarredMessagesQuery,
  WorkspaceDiscussionStarredMessagesQueryVariables,
  WorkspaceDiscussionSyncQuery,
  WorkspaceDiscussionSyncQueryVariables,
  WorkspaceDiscussionThreadMessagesQuery,
  WorkspaceDiscussionThreadMessagesQueryVariables,
  WorkspaceEditDiscussionMessageMutation,
  WorkspaceEditDiscussionMessageMutationVariables,
  WorkspaceReactToDiscussionMessageMutation,
  WorkspaceReactToDiscussionMessageMutationVariables,
  WorkspaceSendDiscussionMessageMutation,
  WorkspaceSendDiscussionMessageMutationVariables,
  WorkspaceSetDiscussionMessagePinnedMutation,
  WorkspaceSetDiscussionMessagePinnedMutationVariables,
  WorkspaceSetDiscussionMessageStarredMutation,
  WorkspaceSetDiscussionMessageStarredMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const DISCUSSION_MESSAGE_FIELDS = gql`
  fragment WorkspaceDiscussionMessageFields on DiscussionMessageType {
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
      usernames
      reactedByMe
    }
    threadId
    showInMainList
    threadReplyCount
    threadLastReplyAt
  }
`;

export const WORKSPACE_DISCUSSION_INFO: TypedDocumentNode<
  WorkspaceDiscussionInfoQuery,
  WorkspaceDiscussionInfoQueryVariables
> = gql`
  query workspaceDiscussionInfo($committeeId: String!) {
    workspaceDiscussionInfo(committeeId: $committeeId) {
      canPost
      canPin
    }
  }
`;

export const WORKSPACE_DISCUSSION_MEMBERS: TypedDocumentNode<
  WorkspaceDiscussionMembersQuery,
  WorkspaceDiscussionMembersQueryVariables
> = gql`
  query workspaceDiscussionMembers($committeeId: String!) {
    workspaceDiscussionMembers(committeeId: $committeeId) {
      username
      name
      imageUrl
      imageThumbnailUrl
    }
  }
`;

export const WORKSPACE_DISCUSSION_SYNC: TypedDocumentNode<
  WorkspaceDiscussionSyncQuery,
  WorkspaceDiscussionSyncQueryVariables
> = gql`
  query workspaceDiscussionSync($committeeId: String!, $since: String) {
    workspaceDiscussionSync(committeeId: $committeeId, since: $since) {
      messages {
        ...WorkspaceDiscussionMessageFields
      }
      deletedIds
      syncedAt
      hasOlder
    }
  }
  ${DISCUSSION_MESSAGE_FIELDS}
`;

export const WORKSPACE_DISCUSSION_THREAD_MESSAGES: TypedDocumentNode<
  WorkspaceDiscussionThreadMessagesQuery,
  WorkspaceDiscussionThreadMessagesQueryVariables
> = gql`
  query workspaceDiscussionThreadMessages(
    $committeeId: String!
    $threadId: String!
  ) {
    workspaceDiscussionThreadMessages(
      committeeId: $committeeId
      threadId: $threadId
    ) {
      ...WorkspaceDiscussionMessageFields
    }
  }
  ${DISCUSSION_MESSAGE_FIELDS}
`;

export const WORKSPACE_DISCUSSION_PINNED_MESSAGES: TypedDocumentNode<
  WorkspaceDiscussionPinnedMessagesQuery,
  WorkspaceDiscussionPinnedMessagesQueryVariables
> = gql`
  query workspaceDiscussionPinnedMessages($committeeId: String!) {
    workspaceDiscussionPinnedMessages(committeeId: $committeeId) {
      ...WorkspaceDiscussionMessageFields
    }
  }
  ${DISCUSSION_MESSAGE_FIELDS}
`;

export const WORKSPACE_DISCUSSION_STARRED_MESSAGES: TypedDocumentNode<
  WorkspaceDiscussionStarredMessagesQuery,
  WorkspaceDiscussionStarredMessagesQueryVariables
> = gql`
  query workspaceDiscussionStarredMessages($committeeId: String!) {
    workspaceDiscussionStarredMessages(committeeId: $committeeId) {
      ...WorkspaceDiscussionMessageFields
    }
  }
  ${DISCUSSION_MESSAGE_FIELDS}
`;

export const WORKSPACE_DISCUSSION_SEARCH_MESSAGES: TypedDocumentNode<
  WorkspaceDiscussionSearchMessagesQuery,
  WorkspaceDiscussionSearchMessagesQueryVariables
> = gql`
  query workspaceDiscussionSearchMessages(
    $committeeId: String!
    $searchText: String!
    $offset: Int
  ) {
    workspaceDiscussionSearchMessages(
      committeeId: $committeeId
      searchText: $searchText
      offset: $offset
    ) {
      messages {
        ...WorkspaceDiscussionMessageFields
      }
      hasMore
    }
  }
  ${DISCUSSION_MESSAGE_FIELDS}
`;

export const WORKSPACE_DISCUSSION_OLDER_MESSAGES: TypedDocumentNode<
  WorkspaceDiscussionOlderMessagesQuery,
  WorkspaceDiscussionOlderMessagesQueryVariables
> = gql`
  query workspaceDiscussionOlderMessages($committeeId: String!, $before: String!) {
    workspaceDiscussionOlderMessages(committeeId: $committeeId, before: $before) {
      messages {
        ...WorkspaceDiscussionMessageFields
      }
      hasMore
    }
  }
  ${DISCUSSION_MESSAGE_FIELDS}
`;

export const WORKSPACE_SEND_DISCUSSION_MESSAGE: TypedDocumentNode<
  WorkspaceSendDiscussionMessageMutation,
  WorkspaceSendDiscussionMessageMutationVariables
> = gql`
  mutation workspaceSendDiscussionMessage(
    $committeeId: String!
    $text: String!
    $threadId: String
  ) {
    workspaceSendDiscussionMessage(
      committeeId: $committeeId
      text: $text
      threadId: $threadId
    )
  }
`;

export const WORKSPACE_REACT_TO_DISCUSSION_MESSAGE: TypedDocumentNode<
  WorkspaceReactToDiscussionMessageMutation,
  WorkspaceReactToDiscussionMessageMutationVariables
> = gql`
  mutation workspaceReactToDiscussionMessage(
    $committeeId: String!
    $messageId: String!
    $emoji: String!
    $shouldReact: Boolean!
  ) {
    workspaceReactToDiscussionMessage(
      committeeId: $committeeId
      messageId: $messageId
      emoji: $emoji
      shouldReact: $shouldReact
    )
  }
`;

export const WORKSPACE_SET_DISCUSSION_MESSAGE_STARRED: TypedDocumentNode<
  WorkspaceSetDiscussionMessageStarredMutation,
  WorkspaceSetDiscussionMessageStarredMutationVariables
> = gql`
  mutation workspaceSetDiscussionMessageStarred(
    $committeeId: String!
    $messageId: String!
    $starred: Boolean!
  ) {
    workspaceSetDiscussionMessageStarred(
      committeeId: $committeeId
      messageId: $messageId
      starred: $starred
    )
  }
`;

export const WORKSPACE_SET_DISCUSSION_MESSAGE_PINNED: TypedDocumentNode<
  WorkspaceSetDiscussionMessagePinnedMutation,
  WorkspaceSetDiscussionMessagePinnedMutationVariables
> = gql`
  mutation workspaceSetDiscussionMessagePinned(
    $committeeId: String!
    $messageId: String!
    $pinned: Boolean!
  ) {
    workspaceSetDiscussionMessagePinned(
      committeeId: $committeeId
      messageId: $messageId
      pinned: $pinned
    )
  }
`;

export const WORKSPACE_EDIT_DISCUSSION_MESSAGE: TypedDocumentNode<
  WorkspaceEditDiscussionMessageMutation,
  WorkspaceEditDiscussionMessageMutationVariables
> = gql`
  mutation workspaceEditDiscussionMessage(
    $committeeId: String!
    $messageId: String!
    $text: String!
  ) {
    workspaceEditDiscussionMessage(
      committeeId: $committeeId
      messageId: $messageId
      text: $text
    )
  }
`;

export const WORKSPACE_DELETE_DISCUSSION_MESSAGE: TypedDocumentNode<
  WorkspaceDeleteDiscussionMessageMutation,
  WorkspaceDeleteDiscussionMessageMutationVariables
> = gql`
  mutation workspaceDeleteDiscussionMessage(
    $committeeId: String!
    $messageId: String!
  ) {
    workspaceDeleteDiscussionMessage(
      committeeId: $committeeId
      messageId: $messageId
    )
  }
`;
