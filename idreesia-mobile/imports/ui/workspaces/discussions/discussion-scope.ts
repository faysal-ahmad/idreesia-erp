import { useMemo } from 'react';

import { WorkspacesPaths } from '../paths';
import {
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
} from './gql';

/**
 * Which discussion the screens show. Today that is always a committee's; the
 * scope gathers the documents, variables, paths and file route the screens
 * need.
 */
export interface DiscussionScope {
  /** Changes when the discussion does, so the store loads again. */
  key: string;
  committeeId: string;
  /** Sent with every operation. */
  variables: { committeeId: string; projectId?: string };
  /** Screen title until the caller's name for it is known. */
  defaultTitle: string;
  /** Where the main screen's back arrow goes. */
  backTo: string;
  paths: {
    main: string;
    mainPattern: string;
    thread: (threadId: string) => string;
    threadPattern: string;
    search: string;
    searchPattern: string;
    pinned: string;
    pinnedPattern: string;
    starred: string;
    starredPattern: string;
  };
  /** The ERP file route that takes uploads. */
  uploadPath: string;
  docs: {
    info: typeof MOBILE_WORKSPACE_DISCUSSION_INFO;
    members: typeof MOBILE_WORKSPACE_DISCUSSION_MEMBERS;
    sync: typeof MOBILE_WORKSPACE_DISCUSSION_SYNC;
    older: typeof MOBILE_WORKSPACE_DISCUSSION_OLDER_MESSAGES;
    thread: typeof MOBILE_WORKSPACE_DISCUSSION_THREAD_MESSAGES;
    pinned: typeof MOBILE_WORKSPACE_DISCUSSION_PINNED_MESSAGES;
    starred: typeof MOBILE_WORKSPACE_DISCUSSION_STARRED_MESSAGES;
    search: typeof MOBILE_WORKSPACE_DISCUSSION_SEARCH_MESSAGES;
    send: typeof MOBILE_WORKSPACE_SEND_DISCUSSION_MESSAGE;
    react: typeof MOBILE_WORKSPACE_REACT_TO_DISCUSSION_MESSAGE;
    star: typeof MOBILE_WORKSPACE_SET_DISCUSSION_MESSAGE_STARRED;
    pin: typeof MOBILE_WORKSPACE_SET_DISCUSSION_MESSAGE_PINNED;
    edit: typeof MOBILE_WORKSPACE_EDIT_DISCUSSION_MESSAGE;
    remove: typeof MOBILE_WORKSPACE_DELETE_DISCUSSION_MESSAGE;
  };
  /** The committee's discussion also loads the committee's name for the title. */
  titleFromInfo: boolean;
}

const committeeScope = (committeeId: string): DiscussionScope => ({
  key: committeeId,
  committeeId,
  variables: { committeeId },
  defaultTitle: 'Discussions',
  backTo: WorkspacesPaths.root,
  paths: {
    main: WorkspacesPaths.committeeDiscussions(committeeId),
    mainPattern: WorkspacesPaths.committeeDiscussionsPattern,
    thread: threadId => WorkspacesPaths.committeeDiscussionThread(committeeId, threadId),
    threadPattern: WorkspacesPaths.committeeDiscussionThreadPattern,
    search: WorkspacesPaths.committeeDiscussionSearch(committeeId),
    searchPattern: WorkspacesPaths.committeeDiscussionSearchPattern,
    pinned: WorkspacesPaths.committeeDiscussionPinned(committeeId),
    pinnedPattern: WorkspacesPaths.committeeDiscussionPinnedPattern,
    starred: WorkspacesPaths.committeeDiscussionStarred(committeeId),
    starredPattern: WorkspacesPaths.committeeDiscussionStarredPattern,
  },
  uploadPath: `/api/workspaces/committees/${encodeURIComponent(committeeId)}/discussions/files`,
  docs: {
    info: MOBILE_WORKSPACE_DISCUSSION_INFO,
    members: MOBILE_WORKSPACE_DISCUSSION_MEMBERS,
    sync: MOBILE_WORKSPACE_DISCUSSION_SYNC,
    older: MOBILE_WORKSPACE_DISCUSSION_OLDER_MESSAGES,
    thread: MOBILE_WORKSPACE_DISCUSSION_THREAD_MESSAGES,
    pinned: MOBILE_WORKSPACE_DISCUSSION_PINNED_MESSAGES,
    starred: MOBILE_WORKSPACE_DISCUSSION_STARRED_MESSAGES,
    search: MOBILE_WORKSPACE_DISCUSSION_SEARCH_MESSAGES,
    send: MOBILE_WORKSPACE_SEND_DISCUSSION_MESSAGE,
    react: MOBILE_WORKSPACE_REACT_TO_DISCUSSION_MESSAGE,
    star: MOBILE_WORKSPACE_SET_DISCUSSION_MESSAGE_STARRED,
    pin: MOBILE_WORKSPACE_SET_DISCUSSION_MESSAGE_PINNED,
    edit: MOBILE_WORKSPACE_EDIT_DISCUSSION_MESSAGE,
    remove: MOBILE_WORKSPACE_DELETE_DISCUSSION_MESSAGE,
  },
  titleFromInfo: true,
});

export const useCommitteeDiscussionScope = (committeeId: string) =>
  useMemo(() => committeeScope(committeeId), [committeeId]);
