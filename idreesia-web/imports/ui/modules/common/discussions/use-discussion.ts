import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type {
  DiscussionDataProvider,
  DiscussionMessage,
  DiscussionSync,
} from './types';

const byTime = (a: DiscussionMessage, b: DiscussionMessage) =>
  (a.sentAt ?? '').localeCompare(b.sentAt ?? '');

// Jumping to an old message loads older pages until it is found; give up
// after this many pages.
const MAX_JUMP_PAGES = 20;

const oldestSentAt = (messages: DiscussionMessage[]) =>
  messages.reduce<string | undefined>(
    (oldest, message) =>
      message.sentAt && (!oldest || message.sentAt < oldest)
        ? message.sentAt
        : oldest,
    undefined
  );

/**
 * Loads a discussion through its provider and keeps it current: the latest
 * messages first, then every `pollIntervalMs` (while the page is visible)
 * whatever changed since the previous sync: new messages, edits, reactions,
 * pins, thread replies and deletions.
 *
 * All messages, main list and thread replies alike, are held in one store
 * keyed by id; the views pick what they show.
 */
const useDiscussion = (provider: DiscussionDataProvider) => {
  const [messages, setMessages] = useState<DiscussionMessage[]>([]);
  const [canPost, setCanPost] = useState(false);
  const [canPin, setCanPin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasOlder, setHasOlder] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);

  // Paging back through history: the oldest message time loaded so far
  // (from the initial load and older pages, not threads opened on the side).
  const oldestLoadedRef = useRef<string | undefined>(undefined);
  const hasOlderRef = useRef(false);
  const olderRequestRef = useRef<Promise<void> | null>(null);

  const storeRef = useRef(new Map<string, DiscussionMessage>());
  const syncedAtRef = useRef<string | undefined>(undefined);
  const syncingRef = useRef(false);

  const publish = () => {
    setMessages(Array.from(storeRef.current.values()).sort(byTime));
  };

  const merge = (incoming: DiscussionMessage[], deletedIds: string[] = []) => {
    incoming.forEach(message => storeRef.current.set(message._id, message));
    deletedIds.forEach(id => storeRef.current.delete(id));
    publish();
  };

  const applySync = (result: DiscussionSync) => {
    syncedAtRef.current = result.syncedAt;
    merge(result.messages, result.deletedIds);
  };

  // Fetches what changed since the last sync. Overlapping calls are
  // skipped; a failed sync is retried on the next tick.
  const sync = useCallback(async () => {
    if (syncingRef.current || !syncedAtRef.current) return;
    syncingRef.current = true;
    try {
      applySync(await provider.syncMessages(syncedAtRef.current));
    } catch {
      // Keep showing what we have.
    } finally {
      syncingRef.current = false;
    }
  }, [provider]);

  // Initial load whenever the provider changes.
  useEffect(() => {
    let cancelled = false;
    storeRef.current = new Map();
    syncedAtRef.current = undefined;
    oldestLoadedRef.current = undefined;
    hasOlderRef.current = false;
    olderRequestRef.current = null;
    setHasOlder(false);
    publish();
    setLoading(true);
    setError(null);

    Promise.all([provider.getInfo(), provider.syncMessages()])
      .then(([info, initial]) => {
        if (cancelled) return;
        setCanPost(info.canPost);
        setCanPin(info.canPin);
        applySync(initial);
        oldestLoadedRef.current = oldestSentAt(initial.messages);
        hasOlderRef.current = !!initial.hasOlder && !!oldestLoadedRef.current;
        setHasOlder(hasOlderRef.current);
      })
      .catch((loadError: Error) => {
        if (!cancelled) setError(loadError.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [provider]);

  // Polling, paused while the page is hidden.
  useEffect(() => {
    if (loading || error) return undefined;

    const interval = setInterval(() => {
      if (!document.hidden) sync();
    }, provider.pollIntervalMs);

    const handleVisibility = () => {
      if (!document.hidden) sync();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [provider, sync, loading, error]);

  // Every action syncs afterwards so its effect shows straight away.
  const thenSync = useCallback(
    async (action: Promise<void>) => {
      await action;
      await sync();
    },
    [sync]
  );

  const loadThread = useCallback(
    async (threadId: string) => {
      merge(await provider.loadThreadMessages(threadId));
    },
    [provider]
  );

  // Loads the page before the oldest loaded message. Concurrent calls share
  // one request.
  const loadOlder = useCallback((): Promise<void> => {
    if (olderRequestRef.current) return olderRequestRef.current;
    const before = oldestLoadedRef.current;
    if (!hasOlderRef.current || !before) return Promise.resolve();

    setLoadingOlder(true);
    const request = provider
      .loadOlderMessages(before)
      .then(page => {
        merge(page.messages);
        const oldest = oldestSentAt(page.messages);
        if (oldest) oldestLoadedRef.current = oldest;
        hasOlderRef.current = page.hasMore && !!oldest;
        setHasOlder(hasOlderRef.current);
      })
      .finally(() => {
        olderRequestRef.current = null;
        setLoadingOlder(false);
      });
    olderRequestRef.current = request;
    return request;
  }, [provider]);

  // Makes sure a message is loaded, paging back through history if needed.
  // Resolves false when it couldn't be found.
  const ensureLoaded = useCallback(
    async (messageId: string): Promise<boolean> => {
      for (let page = 0; !storeRef.current.has(messageId); page += 1) {
        if (!hasOlderRef.current || page >= MAX_JUMP_PAGES) return false;
        await loadOlder();
      }
      return true;
    },
    [loadOlder]
  );

  // Stable across renders, so consumers can memoize on it.
  const operations = useMemo(
    () => ({
      refresh: sync,
      loadThread,
      loadOlder,
      ensureLoaded,
      sendMessage: (text: string, threadId?: string) =>
        thenSync(provider.sendMessage(text, threadId)),
      uploadFile: (file: File, threadId?: string) =>
        thenSync(provider.uploadFile(file, threadId)),
      reactToMessage: (messageId: string, emoji: string, shouldReact: boolean) =>
        thenSync(provider.reactToMessage(messageId, emoji, shouldReact)),
      setMessageStarred: (messageId: string, starred: boolean) =>
        thenSync(provider.setMessageStarred(messageId, starred)),
      setMessagePinned: (messageId: string, pinned: boolean) =>
        thenSync(provider.setMessagePinned(messageId, pinned)),
      editMessage: (messageId: string, text: string) =>
        thenSync(provider.editMessage(messageId, text)),
      deleteMessage: (messageId: string) =>
        thenSync(provider.deleteMessage(messageId)),
    }),
    [provider, sync, loadThread, loadOlder, ensureLoaded, thenSync]
  );

  return {
    messages,
    canPost,
    canPin,
    loading,
    error,
    hasOlder,
    loadingOlder,
    operations,
  };
};

export default useDiscussion;
