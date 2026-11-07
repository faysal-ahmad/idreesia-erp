import React, { useLayoutEffect, useRef } from 'react';
import { MessageOutline } from 'antd-mobile-icons';

import { PageEmpty, PageError, PageLoading } from '../layout';
import { ChatMedia } from './chat-media';
import type { ChatMessage } from './use-chat-messages';

// The page scrolls as a whole (the composer is a sticky footer), so "at the
// bottom" is measured on the document.
const BOTTOM_THRESHOLD_PX = 120;

const isNearBottom = () => {
  const { scrollTop, scrollHeight, clientHeight } = document.scrollingElement ?? document.documentElement;
  return scrollHeight - scrollTop - clientHeight < BOTTOM_THRESHOLD_PX;
};

const scrollToBottom = () => {
  const scroller = document.scrollingElement ?? document.documentElement;
  scroller.scrollTop = scroller.scrollHeight;
};

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

const formatDay = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });

const dayKey = (iso: string) => new Date(iso).toDateString();

interface Props {
  messages: ChatMessage[];
  loading: boolean;
  error: unknown;
  onRetry: () => void;
}

export const ChatThread = ({ messages, loading, error, onRetry }: Props) => {
  const scrolledOnce = useRef(false);
  const wasNearBottom = useRef(true);
  const lastMessageId = messages.length ? messages[messages.length - 1]._id : null;

  // Remember whether the reader was at the bottom before new messages render,
  // so they follow the conversation unless they've scrolled up to read.
  wasNearBottom.current = scrolledOnce.current ? isNearBottom() : true;

  useLayoutEffect(() => {
    if (!lastMessageId) return;
    if (!scrolledOnce.current || wasNearBottom.current) {
      scrollToBottom();
      scrolledOnce.current = true;
    }
  }, [lastMessageId]);

  if (loading && messages.length === 0) return <PageLoading />;
  if (error && messages.length === 0) return <PageError error={error} onRetry={onRetry} />;
  if (messages.length === 0) {
    return (
      <PageEmpty
        description="Send us a message to get started. You can also send a photo or a voice note."
        icon={<MessageOutline />}
        title="No messages yet"
      />
    );
  }

  const items: React.ReactNode[] = [];
  messages.forEach((message, index) => {
    const previous = messages[index - 1];
    if (!previous || dayKey(previous.sentAt) !== dayKey(message.sentAt)) {
      items.push(
        <div className="chat-divider" key={`day-${message._id}`}>
          {formatDay(message.sentAt)}
        </div>
      );
    }

    if (message.senderType === 'system') {
      items.push(
        <div className="chat-divider" key={message._id}>
          Conversation closed · {formatTime(message.sentAt)}
        </div>
      );
      return;
    }

    const fromCustomer = message.senderType === 'visitor';
    items.push(
      <div className={`chat-row ${fromCustomer ? 'chat-row-mine' : 'chat-row-theirs'}`} key={message._id}>
        <div className="chat-bubble">
          {!fromCustomer && message.senderName && (
            <div className="chat-bubble-sender">{message.senderName}</div>
          )}
          {message.attachments.map((attachment, attachmentIndex) => (
            <div className="chat-bubble-media" key={attachmentIndex}>
              <ChatMedia attachment={attachment} />
            </div>
          ))}
          {message.text && <div className="chat-bubble-text">{message.text}</div>}
          <div className="chat-bubble-time">{formatTime(message.sentAt)}</div>
        </div>
      </div>
    );
  });

  return <div className="chat-thread">{items}</div>;
};
