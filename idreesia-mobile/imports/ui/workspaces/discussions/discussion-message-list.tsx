import React, { useLayoutEffect, useRef } from 'react';
import { Avatar, Button } from 'antd-mobile';
import { MessageOutline, StarFill } from 'antd-mobile-icons';

import { PageEmpty } from '../../layout';
import { DiscussionAttachment } from './discussion-attachment';
import type { DiscussionMessage } from './discussion-types';
import { MessageText } from './message-text';
import { useLongPress } from './use-long-press';

// The page scrolls as a whole (the composer is a sticky footer), so scroll
// positions are measured on the document, as in the public chat.
const BOTTOM_THRESHOLD_PX = 120;
// A sender's messages this close together share one name and avatar.
const GROUP_GAP_MS = 5 * 60 * 1000;

const scroller = () => document.scrollingElement ?? document.documentElement;

const isNearBottom = () => {
  const { scrollTop, scrollHeight, clientHeight } = scroller();
  return scrollHeight - scrollTop - clientHeight < BOTTOM_THRESHOLD_PX;
};

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

const formatDay = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const dayKey = (iso: string) => new Date(iso).toDateString();

/** The DOM id of a message's row, for scrolling to it. */
export const messageElementId = (messageId: string) => `discussion-message-${messageId}`;

const startsGroup = (message: DiscussionMessage, previous: DiscussionMessage | undefined) =>
  !previous ||
  previous.isSystem ||
  previous.senderId !== message.senderId ||
  dayKey(previous.sentAt) !== dayKey(message.sentAt) ||
  new Date(message.sentAt).getTime() - new Date(previous.sentAt).getTime() > GROUP_GAP_MS;

export const SenderAvatar = ({ name, url }: { name: string | null; url: string | null }) =>
  url ? (
    <Avatar className="discussion-avatar" src={url} />
  ) : (
    <span className="discussion-avatar discussion-avatar-letter">
      {(name ?? '?').trim().charAt(0).toUpperCase()}
    </span>
  );

export interface MessageHandlers {
  /** Long press: the message's actions. */
  onOpenActions: (message: DiscussionMessage) => void;
  /** Tapping a reaction: adds or removes the user's own. */
  onToggleReaction: (message: DiscussionMessage, emoji: string, reactedByMe: boolean) => void;
  /** Tapping "N replies". Leave out where threads can't be opened (in a thread). */
  onOpenThread?: (message: DiscussionMessage) => void;
}

interface RowProps extends MessageHandlers {
  message: DiscussionMessage;
  first: boolean;
  highlighted: boolean;
}

const MessageRow = ({ message, first, highlighted, onOpenActions, onToggleReaction, onOpenThread }: RowProps) => {
  const longPress = useLongPress(() => onOpenActions(message));
  const showSender = first && !message.isOwn;

  return (
    <div
      className={[
        'discussion-row',
        message.isOwn ? 'discussion-row-mine' : 'discussion-row-theirs',
        first ? 'discussion-row-first' : '',
        highlighted ? 'discussion-row-highlight' : '',
      ].join(' ')}
      id={messageElementId(message._id)}
    >
      {!message.isOwn && (
        <div className="discussion-avatar-slot">
          {showSender && <SenderAvatar name={message.senderName} url={message.senderAvatarUrl} />}
        </div>
      )}
      <div className="discussion-message">
        <div className="discussion-bubble" {...longPress}>
          {showSender && message.senderName && <div className="discussion-bubble-sender">{message.senderName}</div>}
          {message.attachments.map((attachment, index) => (
            <div className="discussion-bubble-media" key={attachment.url ?? index}>
              <DiscussionAttachment attachment={attachment} />
            </div>
          ))}
          {message.text && <MessageText text={message.text} />}
          <div className="discussion-bubble-meta">
            {message.isPinned && <span className="discussion-badge">Pinned · </span>}
            {message.isStarred && <StarFill className="discussion-star" />}
            {message.editedAt && <span>edited · </span>}
            {formatTime(message.sentAt)}
          </div>
        </div>
        {message.reactions.length > 0 && (
          <div className="discussion-reactions">
            {message.reactions.map(reaction => (
              <button
                className={`discussion-reaction${reaction.reactedByMe ? ' discussion-reaction-mine' : ''}`}
                key={reaction.emoji}
                type="button"
                onClick={() => onToggleReaction(message, reaction.emoji, reaction.reactedByMe)}
              >
                {reaction.emoji} {reaction.count}
              </button>
            ))}
          </div>
        )}
        {onOpenThread && message.threadReplyCount > 0 && (
          <button className="discussion-thread-link" type="button" onClick={() => onOpenThread(message)}>
            {message.threadReplyCount === 1 ? '1 reply' : `${message.threadReplyCount} replies`}
          </button>
        )}
      </div>
    </div>
  );
};

interface Props extends MessageHandlers {
  messages: DiscussionMessage[];
  /** False while hidden under another screen: it then leaves the scroll alone. */
  active?: boolean;
  hasOlder?: boolean;
  loadingOlder?: boolean;
  onLoadOlder?: () => Promise<void>;
  /** Briefly highlighted (after jumping to it). */
  highlightId?: string | null;
  emptyTitle?: string;
  emptyDescription?: string;
}

export const DiscussionMessageList = ({
  messages,
  active = true,
  hasOlder = false,
  loadingOlder = false,
  onLoadOlder,
  highlightId = null,
  emptyTitle = 'No messages yet',
  emptyDescription = 'Messages posted here are seen by everyone in the committee.',
  ...handlers
}: Props) => {
  const scrolledOnce = useRef(false);
  const wasNearBottom = useRef(true);
  // Set while older messages load, to keep the reader's place when they're
  // added above.
  const heightBeforeOlder = useRef<number | null>(null);
  const firstId = messages[0]?._id ?? null;
  const lastId = messages[messages.length - 1]?._id ?? null;

  // Whether the reader was at the bottom before this render, so new messages
  // scroll into view unless they've scrolled up to read.
  if (active) wasNearBottom.current = scrolledOnce.current ? isNearBottom() : true;

  useLayoutEffect(() => {
    if (!lastId || !active) return;
    if (!scrolledOnce.current || wasNearBottom.current) {
      scroller().scrollTop = scroller().scrollHeight;
      scrolledOnce.current = true;
    }
    // Not on `active`: coming back, KeepAlive restores the reader's place.
  }, [lastId]);

  useLayoutEffect(() => {
    if (heightBeforeOlder.current == null) return;
    scroller().scrollTop += scroller().scrollHeight - heightBeforeOlder.current;
    heightBeforeOlder.current = null;
  }, [firstId]);

  const handleLoadOlder = () => {
    if (!onLoadOlder) return;
    heightBeforeOlder.current = scroller().scrollHeight;
    onLoadOlder().catch(() => {
      heightBeforeOlder.current = null;
    });
  };

  if (messages.length === 0) {
    return <PageEmpty description={emptyDescription} icon={<MessageOutline />} title={emptyTitle} />;
  }

  const items: React.ReactNode[] = [];
  messages.forEach((message, index) => {
    const previous = messages[index - 1];
    if (!previous || dayKey(previous.sentAt) !== dayKey(message.sentAt)) {
      items.push(
        <div className="discussion-divider" key={`day-${message._id}`}>
          {formatDay(message.sentAt)}
        </div>,
      );
    }
    if (message.isSystem) {
      items.push(
        <div className="discussion-divider" id={messageElementId(message._id)} key={message._id}>
          {message.text} · {formatTime(message.sentAt)}
        </div>,
      );
      return;
    }
    items.push(
      <MessageRow
        first={startsGroup(message, previous)}
        highlighted={message._id === highlightId}
        key={message._id}
        message={message}
        {...handlers}
      />,
    );
  });

  return (
    <div className="discussion-list">
      {hasOlder && onLoadOlder && (
        <div className="discussion-load-older">
          <Button fill="none" loading={loadingOlder} size="small" onClick={handleLoadOlder}>
            Load earlier messages
          </Button>
        </div>
      )}
      {items}
    </div>
  );
};
