import React, { useLayoutEffect, useRef } from 'react';
import { Empty } from 'antd';
import { format, isSameDay } from 'date-fns';

import MessageBubble from './message-bubble';
import type { DiscussionMessage } from './types';

// How close (px) to the bottom still counts as "at the bottom", so new
// messages keep the list scrolled down unless the user scrolled up to read.
const BOTTOM_THRESHOLD_PX = 80;

interface Props {
  messages: DiscussionMessage[];
  /** Bumped by the parent to force a jump to the bottom (e.g. after sending). */
  scrollToBottomKey: number;
}

const MessageList = ({ messages, scrollToBottomKey }: Props) => {
  const listRef = useRef<HTMLDivElement>(null);
  const atBottomRef = useRef(true);
  const lastMessageId = messages.length ? messages[messages.length - 1]._id : null;

  useLayoutEffect(() => {
    atBottomRef.current = true;
  }, [scrollToBottomKey]);

  // Follow new messages while the user is at the bottom.
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list || !atBottomRef.current) return;
    list.scrollTop = list.scrollHeight;
  }, [lastMessageId, messages.length, scrollToBottomKey]);

  const handleScroll = () => {
    const list = listRef.current;
    if (!list) return;
    atBottomRef.current =
      list.scrollHeight - list.scrollTop - list.clientHeight < BOTTOM_THRESHOLD_PX;
  };

  const items: React.ReactNode[] = [];
  let previousSentAt: Date | null = null;
  messages.forEach(message => {
    const sentAt = message.sentAt ? new Date(message.sentAt) : null;
    if (sentAt && (!previousSentAt || !isSameDay(sentAt, previousSentAt))) {
      items.push(
        <div className="discussion-divider" key={`day-${message._id}`}>
          {format(sentAt, 'EEEE, d MMM yyyy')}
        </div>
      );
    }
    items.push(<MessageBubble key={message._id} message={message} />);
    if (sentAt) previousSentAt = sentAt;
  });

  return (
    <div className="discussion-messages" ref={listRef} onScroll={handleScroll}>
      {messages.length === 0 ? (
        <Empty description="No messages yet. Start the discussion." />
      ) : (
        items
      )}
    </div>
  );
};

export default MessageList;
