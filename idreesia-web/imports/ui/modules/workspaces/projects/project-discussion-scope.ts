import type { DiscussionScope } from '../discussions';

import {
  WORKSPACE_DELETE_PROJECT_DISCUSSION_MESSAGE,
  WORKSPACE_EDIT_PROJECT_DISCUSSION_MESSAGE,
  WORKSPACE_PROJECT_DISCUSSION_INFO,
  WORKSPACE_PROJECT_DISCUSSION_MEMBERS,
  WORKSPACE_PROJECT_DISCUSSION_OLDER_MESSAGES,
  WORKSPACE_PROJECT_DISCUSSION_PINNED_MESSAGES,
  WORKSPACE_PROJECT_DISCUSSION_SEARCH_MESSAGES,
  WORKSPACE_PROJECT_DISCUSSION_STARRED_MESSAGES,
  WORKSPACE_PROJECT_DISCUSSION_SYNC,
  WORKSPACE_PROJECT_DISCUSSION_THREAD_MESSAGES,
  WORKSPACE_REACT_TO_PROJECT_DISCUSSION_MESSAGE,
  WORKSPACE_SEND_PROJECT_DISCUSSION_MESSAGE,
  WORKSPACE_SET_PROJECT_DISCUSSION_MESSAGE_PINNED,
  WORKSPACE_SET_PROJECT_DISCUSSION_MESSAGE_STARRED,
} from './discussion-gql';

/** The discussion scope of one project's private chat. */
export const projectDiscussionScope = (
  committeeId: string,
  projectId: string
): DiscussionScope => ({
  variables: { committeeId, projectId },
  filesPath: `/api/workspaces/committees/${committeeId}/projects/${projectId}/discussions/files`,
  queries: {
    info: {
      document: WORKSPACE_PROJECT_DISCUSSION_INFO,
      field: 'workspaceProjectDiscussionInfo',
    },
    members: {
      document: WORKSPACE_PROJECT_DISCUSSION_MEMBERS,
      field: 'workspaceProjectDiscussionMembers',
    },
    sync: {
      document: WORKSPACE_PROJECT_DISCUSSION_SYNC,
      field: 'workspaceProjectDiscussionSync',
    },
    thread: {
      document: WORKSPACE_PROJECT_DISCUSSION_THREAD_MESSAGES,
      field: 'workspaceProjectDiscussionThreadMessages',
    },
    pinned: {
      document: WORKSPACE_PROJECT_DISCUSSION_PINNED_MESSAGES,
      field: 'workspaceProjectDiscussionPinnedMessages',
    },
    starred: {
      document: WORKSPACE_PROJECT_DISCUSSION_STARRED_MESSAGES,
      field: 'workspaceProjectDiscussionStarredMessages',
    },
    older: {
      document: WORKSPACE_PROJECT_DISCUSSION_OLDER_MESSAGES,
      field: 'workspaceProjectDiscussionOlderMessages',
    },
    search: {
      document: WORKSPACE_PROJECT_DISCUSSION_SEARCH_MESSAGES,
      field: 'workspaceProjectDiscussionSearchMessages',
    },
  },
  mutations: {
    send: {
      document: WORKSPACE_SEND_PROJECT_DISCUSSION_MESSAGE,
      field: 'workspaceSendProjectDiscussionMessage',
    },
    react: {
      document: WORKSPACE_REACT_TO_PROJECT_DISCUSSION_MESSAGE,
      field: 'workspaceReactToProjectDiscussionMessage',
    },
    star: {
      document: WORKSPACE_SET_PROJECT_DISCUSSION_MESSAGE_STARRED,
      field: 'workspaceSetProjectDiscussionMessageStarred',
    },
    pin: {
      document: WORKSPACE_SET_PROJECT_DISCUSSION_MESSAGE_PINNED,
      field: 'workspaceSetProjectDiscussionMessagePinned',
    },
    edit: {
      document: WORKSPACE_EDIT_PROJECT_DISCUSSION_MESSAGE,
      field: 'workspaceEditProjectDiscussionMessage',
    },
    delete: {
      document: WORKSPACE_DELETE_PROJECT_DISCUSSION_MESSAGE,
      field: 'workspaceDeleteProjectDiscussionMessage',
    },
  },
});
