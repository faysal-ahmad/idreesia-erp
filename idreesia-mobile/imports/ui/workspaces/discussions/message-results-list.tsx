import React from 'react';
import { List } from 'antd-mobile';

import { SenderAvatar } from './discussion-message-list';
import type { DiscussionMessage } from './discussion-types';

const formatWhen = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

// A one-line preview: the text, or what was attached.
const preview = (message: DiscussionMessage) =>
  message.text ||
  message.attachments.map(attachment => attachment.title || attachment.kind || 'Attachment').join(', ') ||
  'Message';

interface Props {
  messages: DiscussionMessage[];
  onOpen: (message: DiscussionMessage) => void;
}

/** Messages found by search, or pinned or starred; tap one to go to it. */
export const MessageResultsList = ({ messages, onOpen }: Props) => (
  <List className="discussion-results" mode="card">
    {messages.map(message => (
      <List.Item
        description={<span className="discussion-result-text">{preview(message)}</span>}
        extra={<span className="discussion-result-when">{formatWhen(message.sentAt)}</span>}
        key={message._id}
        prefix={<SenderAvatar name={message.senderName} url={message.senderAvatarUrl} />}
        onClick={() => onOpen(message)}
      >
        {message.senderName ?? 'Unknown'}
        {message.threadId && !message.showInMainList ? <span className="discussion-result-thread"> · in a thread</span> : null}
      </List.Item>
    ))}
  </List>
);
