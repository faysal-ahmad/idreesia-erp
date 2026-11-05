import React, { useLayoutEffect, useRef } from 'react';
import { Button, Empty, Spin, Tag } from 'antd';
import { ArrowLeftOutlined, SyncOutlined } from '@ant-design/icons';
import { useQuery } from '@apollo/client/react';
import { format, isSameDay } from 'date-fns';

import { INBOX_CONVERSATION } from './gql';
import MessageBubble, { type InboxMessage } from './message-bubble';
import ReplyBox from './reply-box';
import useCanReply from './use-can-reply';

const POLL_INTERVAL_MS = 5_000;
// How close (px) to the bottom still counts as "at the bottom", so new
// messages keep the thread scrolled down unless the rep scrolled up to read.
const BOTTOM_THRESHOLD_PX = 80;

interface Props {
  roomId: string;
  onBack: () => void;
}

const ConversationView = ({ roomId, onBack }: Props) => {
  const canReply = useCanReply();
  const threadRef = useRef<HTMLDivElement>(null);
  const atBottomRef = useRef(true);
  const scrolledRoomRef = useRef<string | null>(null);

  const { data, loading, error, refetch } = useQuery(INBOX_CONVERSATION, {
    variables: { roomId },
    pollInterval: POLL_INTERVAL_MS,
    notifyOnNetworkStatusChange: false,
  });

  const conversation = data?.inboxConversation?.conversation;
  const messages: InboxMessage[] = (
    data?.inboxConversation?.messages ?? []
  ).filter(
    (message): message is NonNullable<typeof message> => !!message
  );
  const lastMessageId = messages.length
    ? messages[messages.length - 1]._id
    : null;

  // Jump to the bottom when a conversation first loads, and follow new
  // messages while the rep is already at the bottom.
  useLayoutEffect(() => {
    const thread = threadRef.current;
    if (!thread || messages.length === 0) return;
    if (scrolledRoomRef.current !== roomId || atBottomRef.current) {
      thread.scrollTop = thread.scrollHeight;
      scrolledRoomRef.current = roomId;
      atBottomRef.current = true;
    }
  }, [roomId, lastMessageId, messages.length]);

  const handleScroll = () => {
    const thread = threadRef.current;
    if (!thread) return;
    atBottomRef.current =
      thread.scrollHeight - thread.scrollTop - thread.clientHeight <
      BOTTOM_THRESHOLD_PX;
  };

  const handleSent = () => {
    atBottomRef.current = true;
    refetch();
  };

  if (loading && !data) {
    return (
      <div className="inbox-conversation-state">
        <Spin />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="inbox-conversation-state">
        <Empty description={`Could not load the conversation: ${error.message}`} />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="inbox-conversation-state">
        <Empty description="Conversation not found" />
      </div>
    );
  }

  const renderThread = () => {
    const items: React.ReactNode[] = [];
    let previous: InboxMessage | null = null;
    messages.forEach(message => {
      const sentAt = message.sentAt ? new Date(message.sentAt) : null;
      const previousSentAt = previous?.sentAt ? new Date(previous.sentAt) : null;
      if (previous && previous.roomId !== message.roomId && sentAt) {
        items.push(
          <div className="inbox-thread-divider" key={`room-${message._id}`}>
            New conversation · {format(sentAt, 'd MMM yyyy')}
          </div>
        );
      } else if (sentAt && (!previousSentAt || !isSameDay(sentAt, previousSentAt))) {
        items.push(
          <div className="inbox-thread-divider" key={`day-${message._id}`}>
            {format(sentAt, 'EEEE, d MMM yyyy')}
          </div>
        );
      }
      items.push(<MessageBubble key={message._id} message={message} />);
      previous = message;
    });
    return items;
  };

  return (
    <div className="inbox-conversation">
      <div className="inbox-conversation-header">
        <Button
          className="inbox-conversation-back"
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
          title="Back to conversations"
        />
        <div className="inbox-conversation-title">
          <div className="inbox-conversation-name">
            {conversation.customerName || conversation.mobileNumber}
          </div>
          <div className="inbox-conversation-subtitle">
            {conversation.mobileNumber}
            {conversation.assignedTo
              ? ` · Assigned to ${conversation.assignedTo}`
              : ''}
          </div>
        </div>
        {conversation.open ? null : <Tag>Closed</Tag>}
        <Button
          icon={<SyncOutlined />}
          onClick={() => refetch()}
          title="Reload Messages"
        />
      </div>

      <div className="inbox-thread" ref={threadRef} onScroll={handleScroll}>
        {messages.length === 0 ? (
          <Empty description="No messages yet" />
        ) : (
          renderThread()
        )}
      </div>

      {canReply ? (
        <ReplyBox
          roomId={roomId}
          disabled={!conversation.open}
          onSent={handleSent}
        />
      ) : null}
    </div>
  );
};

export default ConversationView;
