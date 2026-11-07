import React, { useLayoutEffect, useRef } from 'react';
import { Button, Empty } from 'antd';
import { format, isSameDay } from 'date-fns';

import MessageBubble from './message-bubble';
import type { DiscussionMessage } from './types';

// Messages from the same sender within this window are grouped under one
// avatar/name header, as Rocket.Chat does.
const GROUPING_WINDOW_MS = 5 * 60 * 1000;

// How close (px) to the bottom still counts as "at the bottom", so new
// messages keep the list scrolled down unless the user scrolled up to read.
const BOTTOM_THRESHOLD_PX = 80;

// How long a message jumped to stays highlighted.
const HIGHLIGHT_MS = 2500;

export interface MessageListFocus {
  messageId: string;
  /** Bump to scroll to the same message again. */
  key: number;
}

interface Props {
  messages: DiscussionMessage[];
  /** Bumped by the parent to force a jump to the bottom (e.g. after sending). */
  scrollToBottomKey: number;
  /** Shown inside a side panel (thread, pinned, ...). */
  inThread?: boolean;
  emptyText?: string;
  /** Shows a button at the top that loads older messages. */
  hasOlder?: boolean;
  loadingOlder?: boolean;
  onLoadOlder?: () => void;
  olderLabel?: string;
  /** Scrolls to this message and highlights it. */
  focus?: MessageListFocus | null;
  /** Offer "Jump to message" on each message (search, pinned, starred). */
  showJump?: boolean;
}

const MessageList = ({
  messages,
  scrollToBottomKey,
  inThread = false,
  emptyText = 'No messages yet. Start the discussion.',
  hasOlder = false,
  loadingOlder = false,
  onLoadOlder,
  olderLabel = 'Load older messages',
  focus = null,
  showJump = false,
}: Props) => {
  const listRef = useRef<HTMLDivElement>(null);
  const atBottomRef = useRef(true);
  const scrollKeyRef = useRef(scrollToBottomKey);
  const firstIdRef = useRef<string | null>(null);
  const heightRef = useRef(0);
  const focusKeyRef = useRef<number | null>(null);

  // After every render, keep the scroll position where the user expects it.
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    if (scrollKeyRef.current !== scrollToBottomKey) {
      scrollKeyRef.current = scrollToBottomKey;
      atBottomRef.current = true;
    }

    const firstId = messages.length ? messages[0]._id : null;
    const prepended =
      !!firstIdRef.current &&
      firstId !== firstIdRef.current &&
      messages.some(message => message._id === firstIdRef.current);

    if (prepended && !atBottomRef.current) {
      // Older messages were added above: keep the same messages in view.
      list.scrollTop += list.scrollHeight - heightRef.current;
    } else if (atBottomRef.current) {
      // Follow new messages while the user is at the bottom.
      list.scrollTop = list.scrollHeight;
    }

    if (focus && focus.key !== focusKeyRef.current) {
      const element = list.querySelector<HTMLElement>(
        `[data-message-id="${CSS.escape(focus.messageId)}"]`
      );
      if (element) {
        focusKeyRef.current = focus.key;
        atBottomRef.current = false;
        element.scrollIntoView({ block: 'center' });
        element.classList.add('discussion-message-highlight');
        setTimeout(
          () => element.classList.remove('discussion-message-highlight'),
          HIGHLIGHT_MS
        );
      }
    }

    firstIdRef.current = firstId;
    heightRef.current = list.scrollHeight;
  });

  const handleScroll = () => {
    const list = listRef.current;
    if (!list) return;
    atBottomRef.current =
      list.scrollHeight - list.scrollTop - list.clientHeight < BOTTOM_THRESHOLD_PX;
    heightRef.current = list.scrollHeight;
  };

  const items: React.ReactNode[] = [];
  let previousSentAt: Date | null = null;
  let previous: DiscussionMessage | null = null;
  messages.forEach(message => {
    const sentAt = message.sentAt ? new Date(message.sentAt) : null;
    const newDay =
      !!sentAt && (!previousSentAt || !isSameDay(sentAt, previousSentAt));
    if (newDay) {
      items.push(
        <div className="discussion-divider" key={`day-${message._id}`}>
          <span className="discussion-divider-label">
            {format(sentAt!, 'MMMM do, yyyy')}
          </span>
        </div>
      );
    }
    const grouped =
      !newDay &&
      !!previous &&
      !previous.isSystem &&
      !message.isSystem &&
      (previous.senderId ?? previous.senderName) ===
        (message.senderId ?? message.senderName) &&
      !!sentAt &&
      !!previousSentAt &&
      sentAt.getTime() - previousSentAt.getTime() < GROUPING_WINDOW_MS;
    items.push(
      <MessageBubble
        key={message._id}
        message={message}
        grouped={grouped}
        inThread={inThread}
        showJump={showJump}
      />
    );
    if (sentAt) previousSentAt = sentAt;
    previous = message;
  });

  return (
    <div className="discussion-messages" ref={listRef} onScroll={handleScroll}>
      {hasOlder && onLoadOlder ? (
        <div className="discussion-load-older">
          <Button size="small" loading={loadingOlder} onClick={onLoadOlder}>
            {olderLabel}
          </Button>
        </div>
      ) : null}
      {messages.length === 0 ? <Empty description={emptyText} /> : items}
    </div>
  );
};

export default MessageList;
