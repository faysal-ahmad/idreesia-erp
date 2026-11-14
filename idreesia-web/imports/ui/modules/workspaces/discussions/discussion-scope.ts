import type { DocumentNode } from 'graphql';

import {
  WORKSPACE_DELETE_DISCUSSION_MESSAGE,
  WORKSPACE_DISCUSSION_INFO,
  WORKSPACE_DISCUSSION_MEMBERS,
  WORKSPACE_DISCUSSION_OLDER_MESSAGES,
  WORKSPACE_DISCUSSION_PINNED_MESSAGES,
  WORKSPACE_DISCUSSION_SEARCH_MESSAGES,
  WORKSPACE_DISCUSSION_STARRED_MESSAGES,
  WORKSPACE_DISCUSSION_SYNC,
  WORKSPACE_DISCUSSION_THREAD_MESSAGES,
  WORKSPACE_EDIT_DISCUSSION_MESSAGE,
  WORKSPACE_REACT_TO_DISCUSSION_MESSAGE,
  WORKSPACE_SEND_DISCUSSION_MESSAGE,
  WORKSPACE_SET_DISCUSSION_MESSAGE_PINNED,
  WORKSPACE_SET_DISCUSSION_MESSAGE_STARRED,
} from './gql';

/** A GraphQL operation and the field of its result that holds the data. */
export interface DiscussionOp {
  document: DocumentNode;
  field: string;
}

/**
 * What a discussion is attached to: which operations to call, the variables
 * naming it, and its file routes. The committee's discussion is the default;
 * other places that host a discussion (e.g. a project's chat) supply their own
 * scope and share the same provider.
 */
export interface DiscussionScope {
  /** Sent with every operation, e.g. committeeId (and projectId). */
  variables: Record<string, string>;
  /** Upload route; attachments are fetched from the urls the server gives. */
  filesPath: string;
  queries: {
    info: DiscussionOp;
    members: DiscussionOp;
    sync: DiscussionOp;
    thread: DiscussionOp;
    pinned: DiscussionOp;
    starred: DiscussionOp;
    older: DiscussionOp;
    search: DiscussionOp;
  };
  mutations: {
    send: DiscussionOp;
    react: DiscussionOp;
    star: DiscussionOp;
    pin: DiscussionOp;
    edit: DiscussionOp;
    delete: DiscussionOp;
  };
}

export const committeeDiscussionScope = (
  committeeId: string
): DiscussionScope => ({
  variables: { committeeId },
  filesPath: `/api/workspaces/committees/${committeeId}/discussions/files`,
  queries: {
    info: { document: WORKSPACE_DISCUSSION_INFO, field: 'workspaceDiscussionInfo' },
    members: {
      document: WORKSPACE_DISCUSSION_MEMBERS,
      field: 'workspaceDiscussionMembers',
    },
    sync: { document: WORKSPACE_DISCUSSION_SYNC, field: 'workspaceDiscussionSync' },
    thread: {
      document: WORKSPACE_DISCUSSION_THREAD_MESSAGES,
      field: 'workspaceDiscussionThreadMessages',
    },
    pinned: {
      document: WORKSPACE_DISCUSSION_PINNED_MESSAGES,
      field: 'workspaceDiscussionPinnedMessages',
    },
    starred: {
      document: WORKSPACE_DISCUSSION_STARRED_MESSAGES,
      field: 'workspaceDiscussionStarredMessages',
    },
    older: {
      document: WORKSPACE_DISCUSSION_OLDER_MESSAGES,
      field: 'workspaceDiscussionOlderMessages',
    },
    search: {
      document: WORKSPACE_DISCUSSION_SEARCH_MESSAGES,
      field: 'workspaceDiscussionSearchMessages',
    },
  },
  mutations: {
    send: {
      document: WORKSPACE_SEND_DISCUSSION_MESSAGE,
      field: 'workspaceSendDiscussionMessage',
    },
    react: {
      document: WORKSPACE_REACT_TO_DISCUSSION_MESSAGE,
      field: 'workspaceReactToDiscussionMessage',
    },
    star: {
      document: WORKSPACE_SET_DISCUSSION_MESSAGE_STARRED,
      field: 'workspaceSetDiscussionMessageStarred',
    },
    pin: {
      document: WORKSPACE_SET_DISCUSSION_MESSAGE_PINNED,
      field: 'workspaceSetDiscussionMessagePinned',
    },
    edit: {
      document: WORKSPACE_EDIT_DISCUSSION_MESSAGE,
      field: 'workspaceEditDiscussionMessage',
    },
    delete: {
      document: WORKSPACE_DELETE_DISCUSSION_MESSAGE,
      field: 'workspaceDeleteDiscussionMessage',
    },
  },
});
