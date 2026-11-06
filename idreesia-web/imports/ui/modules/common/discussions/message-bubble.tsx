import React from 'react';
import { format } from 'date-fns';

import MessageAttachment from './message-attachment';
import type { DiscussionMessage } from './types';

interface Props {
  message: DiscussionMessage;
}

const MessageBubble = ({ message }: Props) => {
  const { text, sentAt, senderName, isOwn, isSystem, attachments } = message;
  const time = sentAt ? format(new Date(sentAt), 'h:mm a') : '';

  if (isSystem) {
    return (
      <div className="discussion-message-system">
        {text}
        {time ? ` · ${time}` : ''}
      </div>
    );
  }

  return (
    <div
      className={`discussion-message-row ${
        isOwn ? 'discussion-message-row-own' : 'discussion-message-row-other'
      }`}
    >
      <div className="discussion-message-bubble">
        {!isOwn && senderName ? (
          <div className="discussion-message-sender">{senderName}</div>
        ) : null}
        {attachments.map((attachment, index) => (
          <div className="discussion-message-attachment" key={index}>
            <MessageAttachment attachment={attachment} />
          </div>
        ))}
        {text ? <div className="discussion-message-text">{text}</div> : null}
        <div className="discussion-message-time">{time}</div>
      </div>
    </div>
  );
};

export default MessageBubble;
