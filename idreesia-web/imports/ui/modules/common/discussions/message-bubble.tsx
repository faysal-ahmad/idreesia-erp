import React, { useState } from 'react';
import { Button, Dropdown, Input, Tooltip, type MenuProps } from 'antd';
import {
  AimOutlined,
  DeleteOutlined,
  EditOutlined,
  MessageOutlined,
  MoreOutlined,
  PushpinFilled,
  PushpinOutlined,
  SmileOutlined,
  StarFilled,
  StarOutlined,
} from '@ant-design/icons';
import { format, isToday, isYesterday } from 'date-fns';

import DiscussionAvatar from './discussion-avatar';
import { useDiscussionActions } from './discussion-actions';
import EmojiPickerPopover from './emoji-picker-popover';
import MessageAttachment from './message-attachment';
import MessageText from './message-text';
import { MAX_DISCUSSION_MESSAGE_LENGTH, type DiscussionMessage } from './types';

interface Props {
  message: DiscussionMessage;
  /**
   * Continues the previous message's run from the same sender: shown
   * without the avatar and name header (Rocket.Chat "sequential" message).
   */
  grouped: boolean;
  /** Shown inside a thread panel: no thread actions or summary. */
  inThread: boolean;
  /** Offer "Jump to message" (in search, pinned and starred lists). */
  showJump?: boolean;
}

const formatReplyTime = (iso: string) => {
  const date = new Date(iso);
  const time = format(date, 'h:mm a');
  if (isToday(date)) return `Today at ${time}`;
  if (isYesterday(date)) return `Yesterday at ${time}`;
  return `${format(date, 'd MMM yyyy')} at ${time}`;
};

// Edits a message in place: Enter saves, Shift+Enter adds a line, Esc
// cancels.
const MessageEditor = ({
  initialText,
  onSave,
  onCancel,
}: {
  initialText: string;
  onSave(text: string): Promise<boolean>;
  onCancel(): void;
}) => {
  const [text, setText] = useState(initialText);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const trimmed = text.trim();
    if (!trimmed || saving) return;
    if (trimmed === initialText.trim()) {
      onCancel();
      return;
    }
    setSaving(true);
    const saved = await onSave(trimmed);
    setSaving(false);
    if (saved) onCancel();
  };

  return (
    <div className="discussion-message-editor">
      <Input.TextArea
        autoFocus
        value={text}
        onChange={event => setText(event.target.value)}
        onKeyDown={event => {
          if (event.key === 'Escape') onCancel();
          if (
            event.key === 'Enter' &&
            !event.shiftKey &&
            !event.nativeEvent.isComposing
          ) {
            event.preventDefault();
            save();
          }
        }}
        autoSize={{ minRows: 1, maxRows: 10 }}
        maxLength={MAX_DISCUSSION_MESSAGE_LENGTH}
        disabled={saving}
      />
      <div className="discussion-message-editor-actions">
        <span className="discussion-message-editor-hint">
          Esc to cancel · Enter to save
        </span>
        <Button size="small" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button
          size="small"
          type="primary"
          onClick={save}
          loading={saving}
          disabled={!text.trim()}
        >
          Save
        </Button>
      </div>
    </div>
  );
};

const MessageBubble = ({ message, grouped, inThread, showJump = false }: Props) => {
  const actions = useDiscussionActions();
  const [editing, setEditing] = useState(false);
  const {
    _id,
    text,
    sentAt,
    senderName,
    senderAvatarUrl,
    isOwn,
    isSystem,
    attachments,
    editedAt,
    isPinned,
    isStarred,
    reactions,
    threadReplyCount,
    threadLastReplyAt,
  } = message;
  const time = sentAt ? format(new Date(sentAt), 'h:mm a') : '';
  const name = senderName || 'Unknown';

  if (isSystem) {
    return (
      <div
        className="discussion-message discussion-message-system"
        data-message-id={message._id}
      >
        <div className="discussion-message-gutter" />
        <div className="discussion-message-body">
          <span className="discussion-message-system-text">{text}</span>
          {time ? <span className="discussion-message-time">{time}</span> : null}
        </div>
      </div>
    );
  }

  const canAct = actions.canPost && !editing;

  const menuItems: MenuProps['items'] = [
    ...(actions.canPin
      ? [
          {
            key: 'pin',
            icon: isPinned ? <PushpinFilled /> : <PushpinOutlined />,
            label: isPinned ? 'Unpin' : 'Pin',
            onClick: () => actions.setPinned(_id, !isPinned),
          },
        ]
      : []),
    {
      key: 'star',
      icon: isStarred ? <StarFilled /> : <StarOutlined />,
      label: isStarred ? 'Unstar' : 'Star',
      onClick: () => actions.setStarred(_id, !isStarred),
    },
    ...(isOwn
      ? [
          { type: 'divider' as const },
          {
            key: 'edit',
            icon: <EditOutlined />,
            label: 'Edit',
            onClick: () => setEditing(true),
          },
          {
            key: 'delete',
            icon: <DeleteOutlined />,
            label: 'Delete',
            danger: true,
            onClick: () => actions.remove(_id),
          },
        ]
      : []),
  ];

  // Pinned / starred / edited markers, after the time.
  const markers = (
    <>
      {isPinned ? (
        <Tooltip title="Pinned">
          <PushpinFilled className="discussion-message-marker" />
        </Tooltip>
      ) : null}
      {isStarred ? (
        <Tooltip title="Starred">
          <StarFilled className="discussion-message-marker discussion-message-marker-star" />
        </Tooltip>
      ) : null}
      {editedAt ? (
        <Tooltip title={`Edited ${formatReplyTime(editedAt)}`}>
          <span className="discussion-message-edited">(edited)</span>
        </Tooltip>
      ) : null}
    </>
  );

  return (
    <div
      className={`discussion-message ${
        grouped ? 'discussion-message-grouped' : ''
      } ${isPinned ? 'discussion-message-pinned' : ''}`}
      data-message-id={_id}
    >
      <div className="discussion-message-gutter">
        {grouped ? (
          <span className="discussion-message-hover-time">{time}</span>
        ) : (
          <DiscussionAvatar
            className="discussion-message-avatar"
            name={name}
            url={senderAvatarUrl}
          />
        )}
      </div>
      <div className="discussion-message-body">
        {grouped ? null : (
          <div className="discussion-message-header">
            <span className="discussion-message-sender">{name}</span>
            {time ? <span className="discussion-message-time">{time}</span> : null}
            {markers}
          </div>
        )}
        {editing ? (
          <MessageEditor
            initialText={text}
            onSave={newText => actions.edit(_id, newText)}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <>
            {text ? <MessageText text={text} /> : null}
            {grouped && (isPinned || isStarred || editedAt) ? (
              <div className="discussion-message-header">{markers}</div>
            ) : null}
          </>
        )}
        {attachments.map((attachment, index) => (
          <div className="discussion-message-attachment" key={index}>
            <MessageAttachment attachment={attachment} />
          </div>
        ))}

        {reactions.length > 0 ? (
          <div className="discussion-reactions">
            {reactions.map(reaction => (
              <Tooltip
                key={reaction.emoji}
                title={reaction.usernames.join(', ')}
              >
                <button
                  type="button"
                  className={`discussion-reaction ${
                    reaction.reactedByMe ? 'discussion-reaction-mine' : ''
                  }`}
                  disabled={!actions.canPost}
                  onClick={() =>
                    actions.react(_id, reaction.emoji, !reaction.reactedByMe)
                  }
                >
                  <span className="discussion-reaction-emoji">
                    {reaction.emoji}
                  </span>
                  <span>{reaction.count}</span>
                </button>
              </Tooltip>
            ))}
            {actions.canPost ? (
              <EmojiPickerPopover onSelect={emoji => actions.react(_id, emoji, true)}>
                <button
                  type="button"
                  className="discussion-reaction discussion-reaction-add"
                  title="Add reaction"
                >
                  <SmileOutlined />
                </button>
              </EmojiPickerPopover>
            ) : null}
          </div>
        ) : null}

        {!inThread && threadReplyCount > 0 ? (
          <div className="discussion-thread-summary">
            <Button size="small" onClick={() => actions.openThread(_id)}>
              View thread
            </Button>
            <span className="discussion-thread-summary-text">
              {threadReplyCount} {threadReplyCount === 1 ? 'reply' : 'replies'}
              {threadLastReplyAt
                ? `, ${formatReplyTime(threadLastReplyAt)}`
                : ''}
            </span>
          </div>
        ) : null}
      </div>

      {canAct || showJump ? (
        <div className="discussion-message-toolbar">
          {showJump ? (
            <Tooltip title="Jump to message">
              <Button
                type="text"
                size="small"
                icon={<AimOutlined />}
                onClick={() => actions.jumpTo(message)}
              />
            </Tooltip>
          ) : null}
          {canAct ? (
            <>
              <EmojiPickerPopover
                placement="bottomRight"
                onSelect={emoji => actions.react(_id, emoji, true)}
              >
                <Tooltip title="Add reaction">
                  <Button type="text" size="small" icon={<SmileOutlined />} />
                </Tooltip>
              </EmojiPickerPopover>
              {!inThread ? (
                <Tooltip title="Reply in thread">
                  <Button
                    type="text"
                    size="small"
                    icon={<MessageOutlined />}
                    onClick={() => actions.openThread(_id)}
                  />
                </Tooltip>
              ) : null}
              <Dropdown
                menu={{ items: menuItems }}
                trigger={['click']}
                placement="bottomRight"
              >
                <Button type="text" size="small" icon={<MoreOutlined />} />
              </Dropdown>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default MessageBubble;
