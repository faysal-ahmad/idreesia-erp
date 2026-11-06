import { useCallback, useEffect, useRef, useState } from 'react';

import type { DiscussionDataProvider, DiscussionMessage } from './types';

const mergeMessages = (
  current: DiscussionMessage[],
  incoming: DiscussionMessage[]
) => {
  if (incoming.length === 0) return current;
  const byId = new Map(current.map(message => [message._id, message]));
  incoming.forEach(message => byId.set(message._id, message));
  return Array.from(byId.values()).sort((a, b) =>
    (a.sentAt ?? '').localeCompare(b.sentAt ?? '')
  );
};

const latestSentAt = (messages: DiscussionMessage[]) =>
  messages.reduce<string | undefined>(
    (latest, message) =>
      message.sentAt && (!latest || message.sentAt > latest)
        ? message.sentAt
        : latest,
    undefined
  );

/**
 * Loads a discussion through its provider and keeps it current: the latest
 * page first, then only newer messages every `pollIntervalMs` while the page
 * is visible.
 */
const useDiscussion = (provider: DiscussionDataProvider) => {
  const [messages, setMessages] = useState<DiscussionMessage[]>([]);
  const [canPost, setCanPost] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const messagesRef = useRef<DiscussionMessage[]>([]);
  const pollingRef = useRef(false);

  const applyMessages = (next: DiscussionMessage[]) => {
    messagesRef.current = next;
    setMessages(next);
  };

  // Fetches messages newer than the latest one held. Overlapping calls are
  // skipped; a failed poll is retried on the next tick.
  const poll = useCallback(async () => {
    if (pollingRef.current) return;
    pollingRef.current = true;
    try {
      const after = latestSentAt(messagesRef.current);
      const incoming = await provider.loadMessages(after ? { after } : {});
      applyMessages(mergeMessages(messagesRef.current, incoming));
    } catch {
      // Keep showing what we have.
    } finally {
      pollingRef.current = false;
    }
  }, [provider]);

  // Initial load whenever the provider changes.
  useEffect(() => {
    let cancelled = false;
    applyMessages([]);
    setLoading(true);
    setError(null);

    Promise.all([provider.getInfo(), provider.loadMessages()])
      .then(([info, initial]) => {
        if (cancelled) return;
        setCanPost(info.canPost);
        applyMessages(initial);
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
      if (!document.hidden) poll();
    }, provider.pollIntervalMs);

    const handleVisibility = () => {
      if (!document.hidden) poll();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [provider, poll, loading, error]);

  const sendMessage = useCallback(
    async (text: string) => {
      await provider.sendMessage(text);
      await poll();
    },
    [provider, poll]
  );

  const uploadFile = useCallback(
    async (file: File) => {
      await provider.uploadFile(file);
      await poll();
    },
    [provider, poll]
  );

  return {
    messages,
    canPost,
    loading,
    error,
    refresh: poll,
    sendMessage,
    uploadFile,
  };
};

export default useDiscussion;
