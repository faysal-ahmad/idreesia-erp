import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  MobileWorkspaceDiscussionInfoQuery,
  MobileWorkspaceDiscussionInfoQueryVariables,
  MobileWorkspaceDiscussionOlderMessagesQuery,
  MobileWorkspaceDiscussionOlderMessagesQueryVariables,
  MobileWorkspaceDiscussionSyncQuery,
  MobileWorkspaceDiscussionSyncQueryVariables,
  MobileWorkspaceSendDiscussionMessageMutation,
  MobileWorkspaceSendDiscussionMessageMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

import { MOBILE_DISCUSSION_MESSAGE_FIELDS } from './discussion-message-fields';

// The committee's name (the screen title), and whether the user can post
// and pin.
// The committee is null when the user isn't a member.
export const MOBILE_WORKSPACE_DISCUSSION_INFO: TypedDocumentNode<
  MobileWorkspaceDiscussionInfoQuery,
  MobileWorkspaceDiscussionInfoQueryVariables
> = gql`
  query mobileWorkspaceDiscussionInfo($committeeId: String!) {
    workspaceCommitteeById(committeeId: $committeeId) {
      _id
      name
    }
    workspaceDiscussionInfo(committeeId: $committeeId) {
      canPost
      canPin
    }
  }
`;

// Without `since`: the latest messages. With it: what changed since then.
export const MOBILE_WORKSPACE_DISCUSSION_SYNC: TypedDocumentNode<
  MobileWorkspaceDiscussionSyncQuery,
  MobileWorkspaceDiscussionSyncQueryVariables
> = gql`
  query mobileWorkspaceDiscussionSync($committeeId: String!, $since: String) {
    workspaceDiscussionSync(committeeId: $committeeId, since: $since) {
      messages {
        ...MobileDiscussionMessageFields
      }
      deletedIds
      syncedAt
      hasOlder
    }
  }
  ${MOBILE_DISCUSSION_MESSAGE_FIELDS}
`;

export const MOBILE_WORKSPACE_DISCUSSION_OLDER_MESSAGES: TypedDocumentNode<
  MobileWorkspaceDiscussionOlderMessagesQuery,
  MobileWorkspaceDiscussionOlderMessagesQueryVariables
> = gql`
  query mobileWorkspaceDiscussionOlderMessages($committeeId: String!, $before: String!) {
    workspaceDiscussionOlderMessages(committeeId: $committeeId, before: $before) {
      messages {
        ...MobileDiscussionMessageFields
      }
      hasMore
    }
  }
  ${MOBILE_DISCUSSION_MESSAGE_FIELDS}
`;

export const MOBILE_WORKSPACE_SEND_DISCUSSION_MESSAGE: TypedDocumentNode<
  MobileWorkspaceSendDiscussionMessageMutation,
  MobileWorkspaceSendDiscussionMessageMutationVariables
> = gql`
  mutation mobileWorkspaceSendDiscussionMessage($committeeId: String!, $text: String!, $threadId: String) {
    workspaceSendDiscussionMessage(committeeId: $committeeId, text: $text, threadId: $threadId)
  }
`;
