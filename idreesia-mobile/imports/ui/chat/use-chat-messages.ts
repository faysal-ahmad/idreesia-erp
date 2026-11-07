import { useCallback, useEffect, useRef, useState } from 'react';

import { addRoomId, loadRoomIds } from './chat-identity';
import {
  getRoomHistory,
  getVisitor,
  ChatApiError,
  visitorFileUrl,
  type ChatApiAttachment,
  type ChatApiDate,
  type ChatApiMessage,
} from './chat-api';

const POLL_INTERVAL_MS = 10_000;
// After a 429, wait this long before polling again.
const BACKOFF_INTERVAL_MS = 30_000;

export interface ChatAttachment {
  kind: 'image' | 'audio' | 'video' | 'file';
  title?: string;
  url?: string;
}

export interface ChatMessage {
  _id: string;
  rid: string;
  text: string;
  sentAt: string;
  senderType: 'visitor' | 'agent' | 'system';
  senderName?: string;
  attachments: ChatAttachment[];
}

const toIso = (date: ChatApiDate) =>
  new Date(typeof date === 'object' ? date.$date : date).toISOString();

const mapAttachment = (attachment: ChatApiAttachment, rid: string, token: string): ChatAttachment | null => {
  const { title } = attachment;
  if (attachment.image_url) {
    return { kind: 'image', title, url: visitorFileUrl(attachment.image_url, rid, token) };
  }
  if (attachment.audio_url) {
    return { kind: 'audio', title, url: visitorFileUrl(attachment.audio_url, rid, token) };
  }
  if (attachment.video_url) {
    return { kind: 'video', title, url: visitorFileUrl(attachment.video_url, rid, token) };
  }
  if (attachment.title_link) {
    return { kind: 'file', title, url: visitorFileUrl(attachment.title_link, rid, token) };
  }
  return null;
};

// Same rules as the ERP inbox: the visitor's messages carry its token,
// `livechat-close` marks the end of a conversation, other typed messages
// (livechat-started, joins, transfers) aren't shown.
const mapMessage = (message: ChatApiMessage, token: string): ChatMessage | null => {
  if (message.t && message.t !== 'livechat-close') return null;
  let senderType: ChatMessage['senderType'] = 'agent';
  if (message.t === 'livechat-close') senderType = 'system';
  else if (message.token) senderType = 'visitor';

  return {
    _id: message._id,
    rid: message.rid,
    text: message.msg ?? '',
    sentAt: toIso(message.ts),
    senderType,
    senderName: message.alias || message.u?.name || message.u?.username,
    attachments: (message.attachments ?? [])
      .map(attachment => mapAttachment(attachment, message.rid, token))
      .filter((attachment): attachment is ChatAttachment => attachment !== null),
  };
};

/**
 * Every message this device's visitor has (across all of its conversations),
 * oldest first, refreshed every 10 s while the app is visible. Conversations
 * that have closed are fetched once and cached.
 */
export const useChatMessages = (token: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const closedRooms = useRef(new Map<string, ChatMessage[]>());
  const openRooms = useRef(new Map<string, ChatMessage[]>());
  const inFlight = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastChatChecked = useRef(false);
  const mounted = useRef(true);

  const schedule = useCallback((delay: number, run: () => void) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(run, delay);
  }, []);

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    let nextDelay = POLL_INTERVAL_MS;
    try {
      // A device that hasn't chatted before may still know the visitor
      // (same token restored); pick up its latest conversation once.
      if (!lastChatChecked.current) {
        const visitor = await getVisitor(token);
        if (visitor?.lastChat?._id) addRoomId(visitor.lastChat._id);
        lastChatChecked.current = true;
      }

      const roomIds = loadRoomIds();
      const pending = roomIds.filter(rid => !closedRooms.current.has(rid));
      const histories = await Promise.all(
        pending.map(async rid => ({ rid, history: await getRoomHistory(token, rid) }))
      );
      histories.forEach(({ rid, history }) => {
        const mapped = history
          .map(message => mapMessage(message, token))
          .filter((message): message is ChatMessage => message !== null);
        if (history.some(message => message.t === 'livechat-close')) {
          closedRooms.current.set(rid, mapped);
          openRooms.current.delete(rid);
        } else {
          openRooms.current.set(rid, mapped);
        }
      });

      const all = [...closedRooms.current.values(), ...openRooms.current.values()]
        .flat()
        .sort((a, b) => a.sentAt.localeCompare(b.sentAt));
      if (mounted.current) {
        setMessages(all);
        setError(null);
      }
    } catch (refreshError) {
      if (refreshError instanceof ChatApiError && refreshError.status === 429) {
        nextDelay = BACKOFF_INTERVAL_MS;
      } else if (mounted.current) {
        setError(refreshError);
      }
    } finally {
      inFlight.current = false;
      if (mounted.current) {
        setLoading(false);
        if (!document.hidden) schedule(nextDelay, refresh);
      }
    }
  }, [token, schedule]);

  useEffect(() => {
    mounted.current = true;
    refresh();

    // Don't poll while the app is in the background; catch up on return.
    const handleVisibility = () => {
      if (document.hidden) {
        if (timer.current) clearTimeout(timer.current);
      } else {
        refresh();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      mounted.current = false;
      if (timer.current) clearTimeout(timer.current);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [refresh]);

  return { messages, loading, error, refresh };
};
