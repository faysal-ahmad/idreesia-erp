import React, { createContext, type ReactNode, useContext, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';

import { toDeviceUrl } from '/imports/startup/backend';
import { uploadDiscussionFile } from './discussion-files';
import type { DiscussionScope } from './discussion-scope';
import { type Discussion, useDiscussion } from './use-discussion';

export interface DiscussionMember {
  /** Chat username, inserted as @username. */
  username: string;
  name: string | null;
  avatarUrl: string | null;
}

/** Everything the discussion screens share (see discussion-feature.tsx). */
export interface DiscussionContextValue {
  scope: DiscussionScope;
  committeeId: string;
  /** The committee's name (or the project's); null until loaded. */
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
  scope: DiscussionScope;
  /** Overrides the screen title (a project chat is titled with the project). */
  title?: string | null;
  children: ReactNode;
}

export const DiscussionProvider = ({ scope, title, children }: Props) => {
  const { committeeId, variables, docs } = scope;
  const info = useQuery(docs.info, {
    variables,
    fetchPolicy: 'cache-and-network',
  });
  const membersQuery = useQuery(docs.members, {
    variables,
    fetchPolicy: 'cache-and-network',
  });
  const discussion = useDiscussion(scope);
  const [focusId, setFocusId] = useState<string | null>(null);

  const [send] = useMutation(docs.send);
  const [react] = useMutation(docs.react);
  const [star] = useMutation(docs.star);
  const [pin] = useMutation(docs.pin);
  const [edit] = useMutation(docs.edit);
  const [remove] = useMutation(docs.remove);

  const { refresh } = discussion;

  const actions = useMemo<DiscussionContextValue['actions']>(() => {
    const thenSync = async (action: Promise<unknown>) => {
      await action;
      await refresh();
    };
    return {
      sendMessage: (text, threadId) =>
        thenSync(send({ variables: { ...variables, text, threadId: threadId ?? null } })),
      uploadFile: (file, fileName, threadId) =>
        thenSync(uploadDiscussionFile(scope.uploadPath, file, fileName, threadId)),
      react: (messageId, emoji, shouldReact) =>
        thenSync(react({ variables: { ...variables, messageId, emoji, shouldReact } })),
      setStarred: (messageId, starred) => thenSync(star({ variables: { ...variables, messageId, starred } })),
      setPinned: (messageId, pinned) => thenSync(pin({ variables: { ...variables, messageId, pinned } })),
      edit: (messageId, text) => thenSync(edit({ variables: { ...variables, messageId, text } })),
      remove: messageId => thenSync(remove({ variables: { ...variables, messageId } })),
    };
  }, [scope, variables, refresh, send, react, star, pin, edit, remove]);

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
      scope,
      committeeId,
      title: title ?? (scope.titleFromInfo ? (info.data?.workspaceCommitteeById?.name ?? null) : null),
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
    [scope, committeeId, title, info, discussion, members, actions, focusId],
  );

  return <DiscussionContext.Provider value={value}>{children}</DiscussionContext.Provider>;
};
