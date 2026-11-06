import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';

import type {
  WorkspaceDiscussionInfoQuery,
  WorkspaceDiscussionInfoQueryVariables,
  WorkspaceDiscussionMessagesQuery,
  WorkspaceDiscussionMessagesQueryVariables,
  WorkspaceSendDiscussionMessageMutation,
  WorkspaceSendDiscussionMessageMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const WORKSPACE_DISCUSSION_INFO: TypedDocumentNode<
  WorkspaceDiscussionInfoQuery,
  WorkspaceDiscussionInfoQueryVariables
> = gql`
  query workspaceDiscussionInfo($committeeId: String!) {
    workspaceDiscussionInfo(committeeId: $committeeId) {
      canPost
    }
  }
`;

export const WORKSPACE_DISCUSSION_MESSAGES: TypedDocumentNode<
  WorkspaceDiscussionMessagesQuery,
  WorkspaceDiscussionMessagesQueryVariables
> = gql`
  query workspaceDiscussionMessages($committeeId: String!, $after: String) {
    workspaceDiscussionMessages(committeeId: $committeeId, after: $after) {
      _id
      text
      sentAt
      senderName
      isOwn
      isSystem
      attachments {
        kind
        title
        mimeType
        size
        url
      }
    }
  }
`;

export const WORKSPACE_SEND_DISCUSSION_MESSAGE: TypedDocumentNode<
  WorkspaceSendDiscussionMessageMutation,
  WorkspaceSendDiscussionMessageMutationVariables
> = gql`
  mutation workspaceSendDiscussionMessage($committeeId: String!, $text: String!) {
    workspaceSendDiscussionMessage(committeeId: $committeeId, text: $text)
  }
`;
