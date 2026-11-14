import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';

import type {
  WorkspaceDeleteProjectDiscussionMessageMutation,
  WorkspaceDeleteProjectDiscussionMessageMutationVariables,
  WorkspaceEditProjectDiscussionMessageMutation,
  WorkspaceEditProjectDiscussionMessageMutationVariables,
  WorkspaceProjectDiscussionInfoQuery,
  WorkspaceProjectDiscussionInfoQueryVariables,
  WorkspaceProjectDiscussionMembersQuery,
  WorkspaceProjectDiscussionMembersQueryVariables,
  WorkspaceProjectDiscussionOlderMessagesQuery,
  WorkspaceProjectDiscussionOlderMessagesQueryVariables,
  WorkspaceProjectDiscussionPinnedMessagesQuery,
  WorkspaceProjectDiscussionPinnedMessagesQueryVariables,
  WorkspaceProjectDiscussionSearchMessagesQuery,
  WorkspaceProjectDiscussionSearchMessagesQueryVariables,
  WorkspaceProjectDiscussionStarredMessagesQuery,
  WorkspaceProjectDiscussionStarredMessagesQueryVariables,
  WorkspaceProjectDiscussionSyncQuery,
  WorkspaceProjectDiscussionSyncQueryVariables,
  WorkspaceProjectDiscussionThreadMessagesQuery,
  WorkspaceProjectDiscussionThreadMessagesQueryVariables,
  WorkspaceReactToProjectDiscussionMessageMutation,
  WorkspaceReactToProjectDiscussionMessageMutationVariables,
  WorkspaceSendProjectDiscussionMessageMutation,
  WorkspaceSendProjectDiscussionMessageMutationVariables,
  WorkspaceSetProjectDiscussionMessagePinnedMutation,
  WorkspaceSetProjectDiscussionMessagePinnedMutationVariables,
  WorkspaceSetProjectDiscussionMessageStarredMutation,
  WorkspaceSetProjectDiscussionMessageStarredMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

import { DISCUSSION_MESSAGE_FIELDS } from '../discussions/gql';

// A project's private chat: the same messages as a committee discussion,
// keyed by committee and project. The message fragment is shared.

export const WORKSPACE_PROJECT_DISCUSSION_INFO: TypedDocumentNode<
  WorkspaceProjectDiscussionInfoQuery,
  WorkspaceProjectDiscussionInfoQueryVariables
> = gql`
  query workspaceProjectDiscussionInfo($committeeId: String!, $projectId: String!) {
    workspaceProjectDiscussionInfo(committeeId: $committeeId, projectId: $projectId) {
      canPost
      canPin
    }
  }
`;

export const WORKSPACE_PROJECT_DISCUSSION_MEMBERS: TypedDocumentNode<
  WorkspaceProjectDiscussionMembersQuery,
  WorkspaceProjectDiscussionMembersQueryVariables
> = gql`
  query workspaceProjectDiscussionMembers($committeeId: String!, $projectId: String!) {
    workspaceProjectDiscussionMembers(committeeId: $committeeId, projectId: $projectId) {
      username
      name
      imageUrl
      imageThumbnailUrl
    }
  }
`;

export const WORKSPACE_PROJECT_DISCUSSION_SYNC: TypedDocumentNode<
  WorkspaceProjectDiscussionSyncQuery,
  WorkspaceProjectDiscussionSyncQueryVariables
> = gql`
  query workspaceProjectDiscussionSync(
    $committeeId: String!
    $projectId: String!
    $since: String
  ) {
    workspaceProjectDiscussionSync(
      committeeId: $committeeId
      projectId: $projectId
      since: $since
    ) {
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

export const WORKSPACE_PROJECT_DISCUSSION_THREAD_MESSAGES: TypedDocumentNode<
  WorkspaceProjectDiscussionThreadMessagesQuery,
  WorkspaceProjectDiscussionThreadMessagesQueryVariables
> = gql`
  query workspaceProjectDiscussionThreadMessages(
    $committeeId: String!
    $projectId: String!
    $threadId: String!
  ) {
    workspaceProjectDiscussionThreadMessages(
      committeeId: $committeeId
      projectId: $projectId
      threadId: $threadId
    ) {
      ...WorkspaceDiscussionMessageFields
    }
  }
  ${DISCUSSION_MESSAGE_FIELDS}
`;

export const WORKSPACE_PROJECT_DISCUSSION_PINNED_MESSAGES: TypedDocumentNode<
  WorkspaceProjectDiscussionPinnedMessagesQuery,
  WorkspaceProjectDiscussionPinnedMessagesQueryVariables
> = gql`
  query workspaceProjectDiscussionPinnedMessages(
    $committeeId: String!
    $projectId: String!
  ) {
    workspaceProjectDiscussionPinnedMessages(
      committeeId: $committeeId
      projectId: $projectId
    ) {
      ...WorkspaceDiscussionMessageFields
    }
  }
  ${DISCUSSION_MESSAGE_FIELDS}
`;

export const WORKSPACE_PROJECT_DISCUSSION_STARRED_MESSAGES: TypedDocumentNode<
  WorkspaceProjectDiscussionStarredMessagesQuery,
  WorkspaceProjectDiscussionStarredMessagesQueryVariables
> = gql`
  query workspaceProjectDiscussionStarredMessages(
    $committeeId: String!
    $projectId: String!
  ) {
    workspaceProjectDiscussionStarredMessages(
      committeeId: $committeeId
      projectId: $projectId
    ) {
      ...WorkspaceDiscussionMessageFields
    }
  }
  ${DISCUSSION_MESSAGE_FIELDS}
`;

export const WORKSPACE_PROJECT_DISCUSSION_OLDER_MESSAGES: TypedDocumentNode<
  WorkspaceProjectDiscussionOlderMessagesQuery,
  WorkspaceProjectDiscussionOlderMessagesQueryVariables
> = gql`
  query workspaceProjectDiscussionOlderMessages(
    $committeeId: String!
    $projectId: String!
    $before: String!
  ) {
    workspaceProjectDiscussionOlderMessages(
      committeeId: $committeeId
      projectId: $projectId
      before: $before
    ) {
      messages {
        ...WorkspaceDiscussionMessageFields
      }
      hasMore
    }
  }
  ${DISCUSSION_MESSAGE_FIELDS}
`;

export const WORKSPACE_PROJECT_DISCUSSION_SEARCH_MESSAGES: TypedDocumentNode<
  WorkspaceProjectDiscussionSearchMessagesQuery,
  WorkspaceProjectDiscussionSearchMessagesQueryVariables
> = gql`
  query workspaceProjectDiscussionSearchMessages(
    $committeeId: String!
    $projectId: String!
    $searchText: String!
    $offset: Int
  ) {
    workspaceProjectDiscussionSearchMessages(
      committeeId: $committeeId
      projectId: $projectId
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

export const WORKSPACE_SEND_PROJECT_DISCUSSION_MESSAGE: TypedDocumentNode<
  WorkspaceSendProjectDiscussionMessageMutation,
  WorkspaceSendProjectDiscussionMessageMutationVariables
> = gql`
  mutation workspaceSendProjectDiscussionMessage(
    $committeeId: String!
    $projectId: String!
    $text: String!
    $threadId: String
  ) {
    workspaceSendProjectDiscussionMessage(
      committeeId: $committeeId
      projectId: $projectId
      text: $text
      threadId: $threadId
    )
  }
`;

export const WORKSPACE_REACT_TO_PROJECT_DISCUSSION_MESSAGE: TypedDocumentNode<
  WorkspaceReactToProjectDiscussionMessageMutation,
  WorkspaceReactToProjectDiscussionMessageMutationVariables
> = gql`
  mutation workspaceReactToProjectDiscussionMessage(
    $committeeId: String!
    $projectId: String!
    $messageId: String!
    $emoji: String!
    $shouldReact: Boolean!
  ) {
    workspaceReactToProjectDiscussionMessage(
      committeeId: $committeeId
      projectId: $projectId
      messageId: $messageId
      emoji: $emoji
      shouldReact: $shouldReact
    )
  }
`;

export const WORKSPACE_SET_PROJECT_DISCUSSION_MESSAGE_STARRED: TypedDocumentNode<
  WorkspaceSetProjectDiscussionMessageStarredMutation,
  WorkspaceSetProjectDiscussionMessageStarredMutationVariables
> = gql`
  mutation workspaceSetProjectDiscussionMessageStarred(
    $committeeId: String!
    $projectId: String!
    $messageId: String!
    $starred: Boolean!
  ) {
    workspaceSetProjectDiscussionMessageStarred(
      committeeId: $committeeId
      projectId: $projectId
      messageId: $messageId
      starred: $starred
    )
  }
`;

export const WORKSPACE_SET_PROJECT_DISCUSSION_MESSAGE_PINNED: TypedDocumentNode<
  WorkspaceSetProjectDiscussionMessagePinnedMutation,
  WorkspaceSetProjectDiscussionMessagePinnedMutationVariables
> = gql`
  mutation workspaceSetProjectDiscussionMessagePinned(
    $committeeId: String!
    $projectId: String!
    $messageId: String!
    $pinned: Boolean!
  ) {
    workspaceSetProjectDiscussionMessagePinned(
      committeeId: $committeeId
      projectId: $projectId
      messageId: $messageId
      pinned: $pinned
    )
  }
`;

export const WORKSPACE_EDIT_PROJECT_DISCUSSION_MESSAGE: TypedDocumentNode<
  WorkspaceEditProjectDiscussionMessageMutation,
  WorkspaceEditProjectDiscussionMessageMutationVariables
> = gql`
  mutation workspaceEditProjectDiscussionMessage(
    $committeeId: String!
    $projectId: String!
    $messageId: String!
    $text: String!
  ) {
    workspaceEditProjectDiscussionMessage(
      committeeId: $committeeId
      projectId: $projectId
      messageId: $messageId
      text: $text
    )
  }
`;

export const WORKSPACE_DELETE_PROJECT_DISCUSSION_MESSAGE: TypedDocumentNode<
  WorkspaceDeleteProjectDiscussionMessageMutation,
  WorkspaceDeleteProjectDiscussionMessageMutationVariables
> = gql`
  mutation workspaceDeleteProjectDiscussionMessage(
    $committeeId: String!
    $projectId: String!
    $messageId: String!
  ) {
    workspaceDeleteProjectDiscussionMessage(
      committeeId: $committeeId
      projectId: $projectId
      messageId: $messageId
    )
  }
`;
