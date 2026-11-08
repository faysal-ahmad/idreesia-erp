import React, { createContext, type ReactNode, useContext, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';

import { toDeviceUrl } from '/imports/startup/backend';
import { uploadDiscussionFile } from './discussion-files';
import {
  MOBILE_WORKSPACE_DELETE_DISCUSSION_MESSAGE,
  MOBILE_WORKSPACE_DISCUSSION_INFO,
  MOBILE_WORKSPACE_DISCUSSION_MEMBERS,
  MOBILE_WORKSPACE_EDIT_DISCUSSION_MESSAGE,
  MOBILE_WORKSPACE_REACT_TO_DISCUSSION_MESSAGE,
  MOBILE_WORKSPACE_SEND_DISCUSSION_MESSAGE,
  MOBILE_WORKSPACE_SET_DISCUSSION_MESSAGE_PINNED,
  MOBILE_WORKSPACE_SET_DISCUSSION_MESSAGE_STARRED,
} from './gql';
import { type Discussion, useDiscussion } from './use-discussion';

export interface DiscussionMember {
  /** Chat username, inserted as @username. */
  username: string;
  name: string | null;
  avatarUrl: string | null;
}

/** Everything the discussion screens share (see discussion-feature.tsx). */
export interface DiscussionContextValue {
  committeeId: string;
  /** The committee's name; null until loaded. */
  title: string | null;
  canPost: boolean;
  canPin: boolean;
  infoLoading: boolean;
  infoError: unknown;
  retryInfo: () => void;
  discussion: Discussion;
  members: DiscussionMember[];
  /**
   * Every action syncs afterwards so its effect shows straight away. They
   * reject with an Error whose message can be shown to the user.
   */
  actions: {
    sendMessage: (text: string, threadId?: string) => Promise<void>;
    uploadFile: (file: Blob, fileName: string, threadId?: string) => Promise<void>;
    react: (messageId: string, emoji: string, shouldReact: boolean) => Promise<void>;
    setStarred: (messageId: string, starred: boolean) => Promise<void>;
    setPinned: (messageId: string, pinned: boolean) => Promise<void>;
    edit: (messageId: string, text: string) => Promise<void>;
    remove: (messageId: string) => Promise<void>;
  };
  /** A message to scroll to and highlight in the main list (see requestFocus). */
  focusId: string | null;
  requestFocus: (messageId: string | null) => void;
}

const DiscussionContext = createContext<DiscussionContextValue | null>(null);

export const useDiscussionContext = () => {
  const value = useContext(DiscussionContext);
  if (!value) throw new Error('useDiscussionContext must be used inside DiscussionProvider');
  return value;
};

interface Props {
  committeeId: string;
  children: ReactNode;
}

export const DiscussionProvider = ({ committeeId, children }: Props) => {
  const info = useQuery(MOBILE_WORKSPACE_DISCUSSION_INFO, {
    variables: { committeeId },
    fetchPolicy: 'cache-and-network',
  });
  const membersQuery = useQuery(MOBILE_WORKSPACE_DISCUSSION_MEMBERS, {
    variables: { committeeId },
    fetchPolicy: 'cache-and-network',
  });
  const discussion = useDiscussion(committeeId);
  const [focusId, setFocusId] = useState<string | null>(null);

  const [send] = useMutation(MOBILE_WORKSPACE_SEND_DISCUSSION_MESSAGE);
  const [react] = useMutation(MOBILE_WORKSPACE_REACT_TO_DISCUSSION_MESSAGE);
  const [star] = useMutation(MOBILE_WORKSPACE_SET_DISCUSSION_MESSAGE_STARRED);
  const [pin] = useMutation(MOBILE_WORKSPACE_SET_DISCUSSION_MESSAGE_PINNED);
  const [edit] = useMutation(MOBILE_WORKSPACE_EDIT_DISCUSSION_MESSAGE);
  const [remove] = useMutation(MOBILE_WORKSPACE_DELETE_DISCUSSION_MESSAGE);

  const { refresh } = discussion;

  const actions = useMemo<DiscussionContextValue['actions']>(() => {
    const thenSync = async (action: Promise<unknown>) => {
      await action;
      await refresh();
    };
    return {
      sendMessage: (text, threadId) =>
        thenSync(send({ variables: { committeeId, text, threadId: threadId ?? null } })),
      uploadFile: (file, fileName, threadId) => thenSync(uploadDiscussionFile(committeeId, file, fileName, threadId)),
      react: (messageId, emoji, shouldReact) =>
        thenSync(react({ variables: { committeeId, messageId, emoji, shouldReact } })),
      setStarred: (messageId, starred) => thenSync(star({ variables: { committeeId, messageId, starred } })),
      setPinned: (messageId, pinned) => thenSync(pin({ variables: { committeeId, messageId, pinned } })),
      edit: (messageId, text) => thenSync(edit({ variables: { committeeId, messageId, text } })),
      remove: messageId => thenSync(remove({ variables: { committeeId, messageId } })),
    };
  }, [committeeId, refresh, send, react, star, pin, edit, remove]);

  const members = useMemo<DiscussionMember[]>(
    () =>
      (membersQuery.data?.workspaceDiscussionMembers ?? [])
        .filter((member): member is NonNullable<typeof member> & { username: string } => Boolean(member?.username))
        .map(member => ({
          username: member.username,
          name: member.name ?? null,
          avatarUrl: toDeviceUrl(member.imageThumbnailUrl ?? member.imageUrl ?? null),
        })),
    [membersQuery.data],
  );

  const value = useMemo<DiscussionContextValue>(
    () => ({
      committeeId,
      title: info.data?.workspaceCommitteeById?.name ?? null,
      canPost: Boolean(info.data?.workspaceDiscussionInfo?.canPost),
      canPin: Boolean(info.data?.workspaceDiscussionInfo?.canPin),
      infoLoading: info.loading && !info.data,
      infoError: info.data ? null : info.error,
      retryInfo: () => {
        info.refetch().catch(() => undefined);
      },
      discussion,
      members,
      actions,
      focusId,
      requestFocus: setFocusId,
    }),
    [committeeId, info, discussion, members, actions, focusId],
  );

  return <DiscussionContext.Provider value={value}>{children}</DiscussionContext.Provider>;
};
