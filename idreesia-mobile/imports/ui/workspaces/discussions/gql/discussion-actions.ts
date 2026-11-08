import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  MobileWorkspaceDeleteDiscussionMessageMutation,
  MobileWorkspaceDeleteDiscussionMessageMutationVariables,
  MobileWorkspaceEditDiscussionMessageMutation,
  MobileWorkspaceEditDiscussionMessageMutationVariables,
  MobileWorkspaceReactToDiscussionMessageMutation,
  MobileWorkspaceReactToDiscussionMessageMutationVariables,
  MobileWorkspaceSetDiscussionMessagePinnedMutation,
  MobileWorkspaceSetDiscussionMessagePinnedMutationVariables,
  MobileWorkspaceSetDiscussionMessageStarredMutation,
  MobileWorkspaceSetDiscussionMessageStarredMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const MOBILE_WORKSPACE_REACT_TO_DISCUSSION_MESSAGE: TypedDocumentNode<
  MobileWorkspaceReactToDiscussionMessageMutation,
  MobileWorkspaceReactToDiscussionMessageMutationVariables
> = gql`
  mutation mobileWorkspaceReactToDiscussionMessage(
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

export const MOBILE_WORKSPACE_SET_DISCUSSION_MESSAGE_STARRED: TypedDocumentNode<
  MobileWorkspaceSetDiscussionMessageStarredMutation,
  MobileWorkspaceSetDiscussionMessageStarredMutationVariables
> = gql`
  mutation mobileWorkspaceSetDiscussionMessageStarred($committeeId: String!, $messageId: String!, $starred: Boolean!) {
    workspaceSetDiscussionMessageStarred(committeeId: $committeeId, messageId: $messageId, starred: $starred)
  }
`;

export const MOBILE_WORKSPACE_SET_DISCUSSION_MESSAGE_PINNED: TypedDocumentNode<
  MobileWorkspaceSetDiscussionMessagePinnedMutation,
  MobileWorkspaceSetDiscussionMessagePinnedMutationVariables
> = gql`
  mutation mobileWorkspaceSetDiscussionMessagePinned($committeeId: String!, $messageId: String!, $pinned: Boolean!) {
    workspaceSetDiscussionMessagePinned(committeeId: $committeeId, messageId: $messageId, pinned: $pinned)
  }
`;

export const MOBILE_WORKSPACE_EDIT_DISCUSSION_MESSAGE: TypedDocumentNode<
  MobileWorkspaceEditDiscussionMessageMutation,
  MobileWorkspaceEditDiscussionMessageMutationVariables
> = gql`
  mutation mobileWorkspaceEditDiscussionMessage($committeeId: String!, $messageId: String!, $text: String!) {
    workspaceEditDiscussionMessage(committeeId: $committeeId, messageId: $messageId, text: $text)
  }
`;

export const MOBILE_WORKSPACE_DELETE_DISCUSSION_MESSAGE: TypedDocumentNode<
  MobileWorkspaceDeleteDiscussionMessageMutation,
  MobileWorkspaceDeleteDiscussionMessageMutationVariables
> = gql`
  mutation mobileWorkspaceDeleteDiscussionMessage($committeeId: String!, $messageId: String!) {
    workspaceDeleteDiscussionMessage(committeeId: $committeeId, messageId: $messageId)
  }
`;
