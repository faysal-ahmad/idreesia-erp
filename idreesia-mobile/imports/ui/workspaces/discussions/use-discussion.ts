import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useApolloClient } from '@apollo/client/react';

import {
  MOBILE_WORKSPACE_DISCUSSION_OLDER_MESSAGES,
  MOBILE_WORKSPACE_DISCUSSION_SYNC,
  MOBILE_WORKSPACE_DISCUSSION_THREAD_MESSAGES,
} from './gql';
import { type DiscussionMessage, toDiscussionMessages } from './discussion-types';

// As on the web.
const POLL_INTERVAL_MS = 5_000;
// Jumping to an old message pages back until it's found; give up after this
// many pages (as on the web).
const MAX_JUMP_PAGES = 20;

const byTime = (a: DiscussionMessage, b: DiscussionMessage) => a.sentAt.localeCompare(b.sentAt);

const oldestSentAt = (messages: DiscussionMessage[]) =>
  messages.reduce<string | undefined>(
    (oldest, message) => (!oldest || message.sentAt < oldest ? message.sentAt : oldest),
    undefined,
  );

/**
 * Loads a committee's discussion and keeps it current: the latest messages
 * first, then every few seconds (while the app is in the foreground) what
 * changed since the previous sync - new messages, edits, reactions, pins,
 * thread replies and deletions. Mirrors the web's use-discussion.ts.
 *
 * Every message (main list and thread replies) is kept in one store keyed by
 * id; `messages` is all of them, oldest first, and screens pick what they
 * show.
 */
export const useDiscussion = (committeeId: string) => {
  const client = useApolloClient();
  const [messages, setMessages] = useState<DiscussionMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [hasOlder, setHasOlder] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  // Bumped to load from scratch again (after an error).
  const [attempt, setAttempt] = useState(0);

  const store = useRef(new Map<string, DiscussionMessage>());
  const syncedAt = useRef<string | undefined>(undefined);
  const syncing = useRef(false);
  // Paging back: the oldest message time loaded so far (initial load and
  // older pages, not threads), whether there's more, and the page loading.
  const oldestLoaded = useRef<string | undefined>(undefined);
  const hasOlderRef = useRef(false);
  const olderRequest = useRef<Promise<void> | null>(null);

  const merge = useCallback((incoming: DiscussionMessage[], deletedIds: string[] = []) => {
    incoming.forEach(message => store.current.set(message._id, message));
    deletedIds.forEach(id => store.current.delete(id));
    setMessages(Array.from(store.current.values()).sort(byTime));
  }, []);

  const setOlder = (value: boolean) => {
    hasOlderRef.current = value;
    setHasOlder(value);
  };

  const fetchSync = useCallback(
    async (since?: string) => {
      const { data } = await client.query({
        query: MOBILE_WORKSPACE_DISCUSSION_SYNC,
        variables: { committeeId, since: since ?? null },
        fetchPolicy: 'network-only',
      });
      const result = data?.workspaceDiscussionSync;
      syncedAt.current = result?.syncedAt ?? since ?? new Date().toISOString();
      const incoming = toDiscussionMessages(result?.messages);
      merge(
        incoming,
        (result?.deletedIds ?? []).filter((id): id is string => Boolean(id)),
      );
      return { incoming, hasOlder: Boolean(result?.hasOlder) };
    },
    [client, committeeId, merge],
  );

  // What changed since the last sync. Overlapping calls are skipped; a failed
  // sync is retried on the next tick.
  const sync = useCallback(async () => {
    if (syncing.current || !syncedAt.current) return;
    syncing.current = true;
    try {
      await fetchSync(syncedAt.current);
    } catch {
      // Keep showing what we have.
    } finally {
      syncing.current = false;
    }
  }, [fetchSync]);

  // Initial load.
  useEffect(() => {
    let cancelled = false;
    store.current = new Map();
    syncedAt.current = undefined;
    oldestLoaded.current = undefined;
    olderRequest.current = null;
    setMessages([]);
    setOlder(false);
    setLoading(true);
    setError(null);

    fetchSync()
      .then(({ incoming, hasOlder: older }) => {
        if (cancelled) return;
        oldestLoaded.current = oldestSentAt(incoming);
        setOlder(older && Boolean(oldestLoaded.current));
      })
      .catch(loadError => {
        if (!cancelled) setError(loadError);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fetchSync, attempt]);

  // Polling, paused while the app is in the background; syncs straight away
  // when it comes back.
  useEffect(() => {
    if (loading || error) return undefined;
    const interval = setInterval(() => {
      if (!document.hidden) sync();
    }, POLL_INTERVAL_MS);
    const handleVisible = () => {
      if (!document.hidden) sync();
    };
    document.addEventListener('visibilitychange', handleVisible);
    document.addEventListener('resume', handleVisible); // Cordova
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisible);
      document.removeEventListener('resume', handleVisible);
    };
  }, [loading, error, sync]);

  // The page before the oldest loaded message. Concurrent calls share one
  // request.
  const loadOlder = useCallback((): Promise<void> => {
    if (olderRequest.current) return olderRequest.current;
    const before = oldestLoaded.current;
    if (!hasOlderRef.current || !before) return Promise.resolve();

    setLoadingOlder(true);
    const request = client
      .query({
        query: MOBILE_WORKSPACE_DISCUSSION_OLDER_MESSAGES,
        variables: { committeeId, before },
        fetchPolicy: 'network-only',
      })
      .then(({ data }) => {
        const page = data?.workspaceDiscussionOlderMessages;
        const older = toDiscussionMessages(page?.messages);
        merge(older);
        const oldest = oldestSentAt(older);
        if (oldest) oldestLoaded.current = oldest;
        setOlder(Boolean(page?.hasMore) && Boolean(oldest));
      })
      .finally(() => {
        olderRequest.current = null;
        setLoadingOlder(false);
      });
    olderRequest.current = request;
    return request;
  }, [client, committeeId, merge]);

  /** Makes sure a message is loaded, paging back if needed; false if not found. */
  const ensureLoaded = useCallback(
    async (messageId: string) => {
      for (let page = 0; !store.current.has(messageId); page += 1) {
        if (!hasOlderRef.current || page >= MAX_JUMP_PAGES) return false;
        await loadOlder();
      }
      return true;
    },
    [loadOlder],
  );

  /** Loads a thread (its parent and all replies) into the store. */
  const loadThread = useCallback(
    async (threadId: string) => {
      const { data } = await client.query({
        query: MOBILE_WORKSPACE_DISCUSSION_THREAD_MESSAGES,
        variables: { committeeId, threadId },
        fetchPolicy: 'network-only',
      });
      merge(toDiscussionMessages(data?.workspaceDiscussionThreadMessages));
    },
    [client, committeeId, merge],
  );

  const getMessage = useCallback((messageId: string) => store.current.get(messageId), []);

  return useMemo(
    () => ({
      messages,
      loading,
      error,
      hasOlder,
      loadingOlder,
      loadOlder,
      ensureLoaded,
      loadThread,
      getMessage,
      /** Fetches what changed now, e.g. right after an action. */
      refresh: sync,
      retry: () => setAttempt(value => value + 1),
    }),
    [messages, loading, error, hasOlder, loadingOlder, loadOlder, ensureLoaded, loadThread, getMessage, sync],
  );
};

export type Discussion = ReturnType<typeof useDiscussion>;
