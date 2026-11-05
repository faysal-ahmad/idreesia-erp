import React from 'react';
import { format } from 'date-fns';

import MessageAttachment, { type InboxAttachment } from './message-attachment';

export interface InboxMessage {
  _id?: string | null;
  roomId?: string | null;
  text?: string | null;
  sentAt?: string | null;
  senderType?: string | null;
  senderName?: string | null;
  attachments?: Array<InboxAttachment | null> | null;
}

interface Props {
  message: InboxMessage;
}

const MessageBubble = ({ message }: Props) => {
  const { text, sentAt, senderType, senderName, attachments } = message;
  const time = sentAt ? format(new Date(sentAt), 'h:mm a') : '';

  if (senderType === 'system') {
    return (
      <div className="inbox-message-system">
        Conversation closed{text ? ` — ${text}` : ''}
        {time ? ` · ${time}` : ''}
      </div>
    );
  }

  const isAgent = senderType === 'agent';
  const files = (attachments ?? []).filter(
    (attachment): attachment is InboxAttachment => !!attachment
  );

  return (
    <div
      className={`inbox-message-row ${
        isAgent ? 'inbox-message-row-agent' : 'inbox-message-row-visitor'
      }`}
    >
      <div className="inbox-message-bubble">
        {isAgent && senderName ? (
          <div className="inbox-message-sender">{senderName}</div>
        ) : null}
        {files.map((attachment, index) => (
          <div className="inbox-message-attachment" key={index}>
            <MessageAttachment attachment={attachment} />
          </div>
        ))}
        {text ? <div className="inbox-message-text">{text}</div> : null}
        <div className="inbox-message-time">{time}</div>
      </div>
    </div>
  );
};

export default MessageBubble;
