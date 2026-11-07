import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Button,
  Divider,
  Mentions,
  Tooltip,
  Upload,
} from 'antd';
import type { MentionsRef } from 'antd/es/mentions';
import Icon, {
  BoldOutlined,
  CodeOutlined,
  ItalicOutlined,
  LinkOutlined,
  PaperClipOutlined,
  SendOutlined,
  SmileOutlined,
  StrikethroughOutlined,
} from '@ant-design/icons';

import DiscussionAvatar from './discussion-avatar';
import { useDiscussionProvider } from './discussion-context';
import EmojiPickerPopover from './emoji-picker-popover';
import {
  MAX_DISCUSSION_FILE_SIZE,
  MAX_DISCUSSION_MESSAGE_LENGTH,
  type DiscussionMember,
} from './types';

interface Props {
  canPost: boolean;
  onSend: (text: string) => Promise<void>;
  /** Without it, the attach-file button is hidden (e.g. thread replies). */
  onUpload?: (file: File) => Promise<void>;
  placeholder?: string;
}

const DEFAULT_PLACEHOLDER =
  'Write a message… (Enter to send, Shift+Enter for a new line, @ to mention)';

const CodeBlockSvg = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M10 10l-2 2 2 2M14 10l2 2-2 2" />
  </svg>
);

/** How a formatting button wraps the selection (Rocket.Chat markdown). */
interface Wrap {
  before: string;
  after: string;
  placeholder: string;
  /** Select this part of the inserted text afterwards (e.g. the link url). */
  selectAfter?: string;
}

const FORMATS: Array<{ key: string; title: string; icon: React.ReactNode; wrap: Wrap }> = [
  { key: 'bold', title: 'Bold', icon: <BoldOutlined />, wrap: { before: '*', after: '*', placeholder: 'bold' } },
  { key: 'italic', title: 'Italic', icon: <ItalicOutlined />, wrap: { before: '_', after: '_', placeholder: 'italic' } },
  { key: 'strike', title: 'Strikethrough', icon: <StrikethroughOutlined />, wrap: { before: '~', after: '~', placeholder: 'strikethrough' } },
  { key: 'code', title: 'Inline code', icon: <CodeOutlined />, wrap: { before: '`', after: '`', placeholder: 'code' } },
  {
    key: 'code-block',
    title: 'Code block',
    icon: <Icon component={CodeBlockSvg} />,
    wrap: { before: '```\n', after: '\n```', placeholder: 'code' },
  },
  {
    key: 'link',
    title: 'Link',
    icon: <LinkOutlined />,
    wrap: { before: '[', after: '](https://)', placeholder: 'text', selectAfter: 'https://' },
  },
];

// Room-wide mentions offered after the members, as in Rocket.Chat.
const ROOM_MENTIONS = [
  { username: 'all', description: 'Notify all in this room' },
  { username: 'here', description: 'Notify active users in this room' },
];

const Composer = ({
  canPost,
  onSend,
  onUpload,
  placeholder = DEFAULT_PLACEHOLDER,
}: Props) => {
  const provider = useDiscussionProvider();
  const mentionsRef = useRef<MentionsRef>(null);
  const [members, setMembers] = useState<DiscussionMember[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Members for @mention suggestions. Failing to load them only means no
  // suggestions; typing a mention by hand still works.
  useEffect(() => {
    if (!canPost) return undefined;
    let cancelled = false;
    provider
      .loadMembers()
      .then(result => {
        if (!cancelled) setMembers(result);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [provider, canPost]);

  const mentionOptions = useMemo(
    () => [
      ...members.map(member => ({
        key: member.username,
        value: member.username,
        label: (
          <div className="discussion-mention-option">
            <DiscussionAvatar
              className="discussion-mention-avatar"
              name={member.name || member.username}
              url={member.avatarUrl}
            />
            <span className="discussion-mention-name">
              {member.name || member.username}
            </span>
            {member.name ? (
              <span className="discussion-mention-username">
                {member.username}
              </span>
            ) : null}
          </div>
        ),
      })),
      ...ROOM_MENTIONS.map(mention => ({
        key: mention.username,
        value: mention.username,
        label: (
          <div className="discussion-mention-option">
            <span className="discussion-mention-name">@{mention.username}</span>
            <span className="discussion-mention-username">
              {mention.description}
            </span>
          </div>
        ),
      })),
    ],
    [members]
  );

  // Match the typed text against the username or the display name.
  const filterMention = (input: string, option: { value?: string }) => {
    const search = input.toLowerCase();
    const username = option.value ?? '';
    const member = members.find(m => m.username === username);
    return (
      username.toLowerCase().includes(search) ||
      !!member?.name?.toLowerCase().includes(search)
    );
  };

  if (!canPost) {
    return (
      <div className="discussion-composer">
        <Alert
          type="info"
          showIcon
          message="You can read this discussion, but you need a chat account to post. Ask an administrator to create one for you."
        />
      </div>
    );
  }

  const getTextArea = () => mentionsRef.current?.textarea;

  /** Replaces the current selection and then sets the caret/selection. */
  const replaceSelection = (
    build: (selected: string) => { insert: string; selectStart: number; selectEnd: number }
  ) => {
    const textArea = getTextArea();
    const start = textArea?.selectionStart ?? text.length;
    const end = textArea?.selectionEnd ?? text.length;
    const { insert, selectStart, selectEnd } = build(text.slice(start, end));
    const nextText = (text.slice(0, start) + insert + text.slice(end)).slice(
      0,
      MAX_DISCUSSION_MESSAGE_LENGTH
    );
    setText(nextText);
    requestAnimationFrame(() => {
      const el = getTextArea();
      if (!el) return;
      el.focus();
      el.setSelectionRange(start + selectStart, start + selectEnd);
    });
  };

  const applyFormat = ({ before, after, placeholder, selectAfter }: Wrap) => {
    replaceSelection(selected => {
      const inner = selected || placeholder;
      const insert = `${before}${inner}${after}`;
      if (selectAfter) {
        const offset = before.length + inner.length + after.indexOf(selectAfter);
        return { insert, selectStart: offset, selectEnd: offset + selectAfter.length };
      }
      // Select the wrapped text so the user can keep typing over a placeholder.
      return {
        insert,
        selectStart: before.length,
        selectEnd: before.length + inner.length,
      };
    });
  };

  const insertEmoji = (emoji: string) => {
    replaceSelection(() => ({
      insert: emoji,
      selectStart: emoji.length,
      selectEnd: emoji.length,
    }));
  };

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setError(null);
    try {
      await onSend(trimmed);
      setText('');
    } catch (sendError) {
      setError(`Could not send the message: ${(sendError as Error).message}`);
    } finally {
      setSending(false);
    }
  };

  const handleUpload = (file: File) => {
    if (!onUpload) return false;
    if (file.size > MAX_DISCUSSION_FILE_SIZE) {
      setError(`${file.name} is too large. Files can be at most 25 MB.`);
      return false;
    }
    setUploading(true);
    setError(null);
    onUpload(file)
      .catch((uploadError: Error) => {
        setError(`Could not upload ${file.name}: ${uploadError.message}`);
      })
      .finally(() => {
        setUploading(false);
      });
    // Uploading is handled here, not by antd.
    return false;
  };

  // Enter sends; Shift+Enter adds a new line. Handled on the container so
  // it runs after Mentions: while its suggestion list is open, Mentions
  // takes Enter (to pick a person) and marks the event handled.
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing &&
      !event.defaultPrevented
    ) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="discussion-composer">
      {error ? (
        <Alert
          className="discussion-composer-error"
          type="error"
          showIcon
          closable
          message={error}
          onClose={() => setError(null)}
        />
      ) : null}
      <div className="discussion-composer-box" onKeyDown={handleKeyDown}>
        <Mentions
          ref={mentionsRef}
          className="discussion-composer-input"
          classNames={{ popup: 'discussion-mention-popup' }}
          variant="borderless"
          prefix="@"
          placement="top"
          options={mentionOptions}
          filterOption={filterMention}
          value={text}
          onChange={setText}
          placeholder={placeholder}
          autoSize={{ minRows: 2, maxRows: 10 }}
          maxLength={MAX_DISCUSSION_MESSAGE_LENGTH}
          disabled={sending}
        />
        <div className="discussion-composer-toolbar">
          <EmojiPickerPopover onSelect={insertEmoji}>
            <Tooltip title="Emoji">
              <Button type="text" icon={<SmileOutlined />} disabled={sending} />
            </Tooltip>
          </EmojiPickerPopover>
          <Divider orientation="vertical" className="discussion-composer-divider" />
          {FORMATS.map(format => (
            <Tooltip title={format.title} key={format.key}>
              <Button
                type="text"
                icon={format.icon}
                disabled={sending}
                onClick={() => applyFormat(format.wrap)}
              />
            </Tooltip>
          ))}
          {onUpload ? (
            <>
              <Divider
                orientation="vertical"
                className="discussion-composer-divider"
              />
              <Upload
                beforeUpload={handleUpload}
                showUploadList={false}
                multiple={false}
              >
                <Tooltip title="Attach a file (up to 25 MB)">
                  <Button
                    type="text"
                    icon={<PaperClipOutlined />}
                    loading={uploading}
                  />
                </Tooltip>
              </Upload>
            </>
          ) : null}
          <div className="discussion-composer-toolbar-spacer" />
          <Tooltip title="Send">
            <Button
              type="text"
              className="discussion-composer-send"
              icon={<SendOutlined />}
              onClick={handleSend}
              loading={sending}
              disabled={!text.trim()}
            />
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default Composer;
