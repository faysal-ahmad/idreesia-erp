import gql from 'graphql-tag';

import { MOBILE_DISCUSSION_MESSAGE_FIELDS } from './discussion-message-fields';
import type {
  MOBILE_WORKSPACE_DELETE_DISCUSSION_MESSAGE,
  MOBILE_WORKSPACE_DISCUSSION_INFO,
  MOBILE_WORKSPACE_DISCUSSION_MEMBERS,
  MOBILE_WORKSPACE_DISCUSSION_OLDER_MESSAGES,
  MOBILE_WORKSPACE_DISCUSSION_PINNED_MESSAGES,
  MOBILE_WORKSPACE_DISCUSSION_SEARCH_MESSAGES,
  MOBILE_WORKSPACE_DISCUSSION_STARRED_MESSAGES,
  MOBILE_WORKSPACE_DISCUSSION_SYNC,
  MOBILE_WORKSPACE_DISCUSSION_THREAD_MESSAGES,
  MOBILE_WORKSPACE_EDIT_DISCUSSION_MESSAGE,
  MOBILE_WORKSPACE_REACT_TO_DISCUSSION_MESSAGE,
  MOBILE_WORKSPACE_SEND_DISCUSSION_MESSAGE,
  MOBILE_WORKSPACE_SET_DISCUSSION_MESSAGE_PINNED,
  MOBILE_WORKSPACE_SET_DISCUSSION_MESSAGE_STARRED,
} from './index';

// A project's private chat. Each operation aliases its root field to the
// committee discussion's field name, so a project chat returns the same shape
// and the discussion screens read both alike. The documents are typed as
// their committee counterparts (the shapes are identical).
type Doc<T> = T;

/** Whether the user can post and pin in the project chat. The title comes from the caller. */
export const MOBILE_PROJECT_DISCUSSION_INFO = gql`
  query mobileWorkspaceProjectDiscussionInfo($committeeId: String!, $projectId: String!) {
    workspaceDiscussionInfo: workspaceProjectDiscussionInfo(committeeId: $committeeId, projectId: $projectId) {
      canPost
      canPin
    }
  }
` as unknown as Doc<typeof MOBILE_WORKSPACE_DISCUSSION_INFO>;

export const MOBILE_PROJECT_DISCUSSION_SYNC = gql`
  query mobileWorkspaceProjectDiscussionSync($committeeId: String!, $projectId: String!, $since: String) {
    workspaceDiscussionSync: workspaceProjectDiscussionSync(
      committeeId: $committeeId
      projectId: $projectId
      since: $since
    ) {
      messages {
        ...MobileDiscussionMessageFields
      }
      deletedIds
      syncedAt
      hasOlder
    }
  }
  ${MOBILE_DISCUSSION_MESSAGE_FIELDS}
` as unknown as Doc<typeof MOBILE_WORKSPACE_DISCUSSION_SYNC>;

export const MOBILE_PROJECT_DISCUSSION_OLDER_MESSAGES = gql`
  query mobileWorkspaceProjectDiscussionOlderMessages($committeeId: String!, $projectId: String!, $before: String!) {
    workspaceDiscussionOlderMessages: workspaceProjectDiscussionOlderMessages(
      committeeId: $committeeId
      projectId: $projectId
      before: $before
    ) {
      messages {
        ...MobileDiscussionMessageFields
      }
      hasMore
    }
  }
  ${MOBILE_DISCUSSION_MESSAGE_FIELDS}
` as unknown as Doc<typeof MOBILE_WORKSPACE_DISCUSSION_OLDER_MESSAGES>;

export const MOBILE_PROJECT_DISCUSSION_THREAD_MESSAGES = gql`
  query mobileWorkspaceProjectDiscussionThreadMessages($committeeId: String!, $projectId: String!, $threadId: String!) {
    workspaceDiscussionThreadMessages: workspaceProjectDiscussionThreadMessages(
      committeeId: $committeeId
      projectId: $projectId
      threadId: $threadId
    ) {
      ...MobileDiscussionMessageFields
    }
  }
  ${MOBILE_DISCUSSION_MESSAGE_FIELDS}
` as unknown as Doc<typeof MOBILE_WORKSPACE_DISCUSSION_THREAD_MESSAGES>;

export const MOBILE_PROJECT_DISCUSSION_MEMBERS = gql`
  query mobileWorkspaceProjectDiscussionMembers($committeeId: String!, $projectId: String!) {
    workspaceDiscussionMembers: workspaceProjectDiscussionMembers(committeeId: $committeeId, projectId: $projectId) {
      username
      name
      imageUrl
      imageThumbnailUrl
    }
  }
` as unknown as Doc<typeof MOBILE_WORKSPACE_DISCUSSION_MEMBERS>;

export const MOBILE_PROJECT_DISCUSSION_PINNED_MESSAGES = gql`
  query mobileWorkspaceProjectDiscussionPinnedMessages($committeeId: String!, $projectId: String!) {
    workspaceDiscussionPinnedMessages: workspaceProjectDiscussionPinnedMessages(
      committeeId: $committeeId
      projectId: $projectId
    ) {
      ...MobileDiscussionMessageFields
    }
  }
  ${MOBILE_DISCUSSION_MESSAGE_FIELDS}
` as unknown as Doc<typeof MOBILE_WORKSPACE_DISCUSSION_PINNED_MESSAGES>;

export const MOBILE_PROJECT_DISCUSSION_STARRED_MESSAGES = gql`
  query mobileWorkspaceProjectDiscussionStarredMessages($committeeId: String!, $projectId: String!) {
    workspaceDiscussionStarredMessages: workspaceProjectDiscussionStarredMessages(
      committeeId: $committeeId
      projectId: $projectId
    ) {
      ...MobileDiscussionMessageFields
    }
  }
  ${MOBILE_DISCUSSION_MESSAGE_FIELDS}
` as unknown as Doc<typeof MOBILE_WORKSPACE_DISCUSSION_STARRED_MESSAGES>;

export const MOBILE_PROJECT_DISCUSSION_SEARCH_MESSAGES = gql`
  query mobileWorkspaceProjectDiscussionSearchMessages(
    $committeeId: String!
    $projectId: String!
    $searchText: String!
    $offset: Int
  ) {
    workspaceDiscussionSearchMessages: workspaceProjectDiscussionSearchMessages(
      committeeId: $committeeId
      projectId: $projectId
      searchText: $searchText
      offset: $offset
    ) {
      messages {
        ...MobileDiscussionMessageFields
      }
      hasMore
    }
  }
  ${MOBILE_DISCUSSION_MESSAGE_FIELDS}
` as unknown as Doc<typeof MOBILE_WORKSPACE_DISCUSSION_SEARCH_MESSAGES>;

export const MOBILE_PROJECT_SEND_DISCUSSION_MESSAGE = gql`
  mutation mobileWorkspaceSendProjectDiscussionMessage(
    $committeeId: String!
    $projectId: String!
    $text: String!
    $threadId: String
  ) {
    workspaceSendDiscussionMessage: workspaceSendProjectDiscussionMessage(
      committeeId: $committeeId
      projectId: $projectId
      text: $text
      threadId: $threadId
    )
  }
` as unknown as Doc<typeof MOBILE_WORKSPACE_SEND_DISCUSSION_MESSAGE>;

export const MOBILE_PROJECT_REACT_TO_DISCUSSION_MESSAGE = gql`
  mutation mobileWorkspaceReactToProjectDiscussionMessage(
    $committeeId: String!
    $projectId: String!
    $messageId: String!
    $emoji: String!
    $shouldReact: Boolean!
  ) {
    workspaceReactToDiscussionMessage: workspaceReactToProjectDiscussionMessage(
      committeeId: $committeeId
      projectId: $projectId
      messageId: $messageId
      emoji: $emoji
      shouldReact: $shouldReact
    )
  }
` as unknown as Doc<typeof MOBILE_WORKSPACE_REACT_TO_DISCUSSION_MESSAGE>;

export const MOBILE_PROJECT_SET_DISCUSSION_MESSAGE_STARRED = gql`
  mutation mobileWorkspaceSetProjectDiscussionMessageStarred(
    $committeeId: String!
    $projectId: String!
    $messageId: String!
    $starred: Boolean!
  ) {
    workspaceSetDiscussionMessageStarred: workspaceSetProjectDiscussionMessageStarred(
      committeeId: $committeeId
      projectId: $projectId
      messageId: $messageId
      starred: $starred
    )
  }
` as unknown as Doc<typeof MOBILE_WORKSPACE_SET_DISCUSSION_MESSAGE_STARRED>;

export const MOBILE_PROJECT_SET_DISCUSSION_MESSAGE_PINNED = gql`
  mutation mobileWorkspaceSetProjectDiscussionMessagePinned(
    $committeeId: String!
    $projectId: String!
    $messageId: String!
    $pinned: Boolean!
  ) {
    workspaceSetDiscussionMessagePinned: workspaceSetProjectDiscussionMessagePinned(
      committeeId: $committeeId
      projectId: $projectId
      messageId: $messageId
      pinned: $pinned
    )
  }
` as unknown as Doc<typeof MOBILE_WORKSPACE_SET_DISCUSSION_MESSAGE_PINNED>;

export const MOBILE_PROJECT_EDIT_DISCUSSION_MESSAGE = gql`
  mutation mobileWorkspaceEditProjectDiscussionMessage(
    $committeeId: String!
    $projectId: String!
    $messageId: String!
    $text: String!
  ) {
    workspaceEditDiscussionMessage: workspaceEditProjectDiscussionMessage(
      committeeId: $committeeId
      projectId: $projectId
      messageId: $messageId
      text: $text
    )
  }
` as unknown as Doc<typeof MOBILE_WORKSPACE_EDIT_DISCUSSION_MESSAGE>;

export const MOBILE_PROJECT_DELETE_DISCUSSION_MESSAGE = gql`
  mutation mobileWorkspaceDeleteProjectDiscussionMessage($committeeId: String!, $projectId: String!, $messageId: String!) {
    workspaceDeleteDiscussionMessage: workspaceDeleteProjectDiscussionMessage(
      committeeId: $committeeId
      projectId: $projectId
      messageId: $messageId
    )
  }
` as unknown as Doc<typeof MOBILE_WORKSPACE_DELETE_DISCUSSION_MESSAGE>;
