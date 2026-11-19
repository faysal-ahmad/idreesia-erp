import React, { useContext } from 'react';
import { Button } from 'antd';
import { VideoCameraOutlined } from '@ant-design/icons';

import { DiscussionActionsContext } from './discussion-actions';

/**
 * Renders the Rocket.Chat markdown subset the composer produces:
 * ```code block```, `inline code`, *bold*, _italic_, ~strike~,
 * [label](url) links and bare http(s) URLs. Builds React elements only
 * (never HTML strings), so message text cannot inject markup.
 */

const CODE_BLOCK = /```(?:[^\n`]*\n)?([\s\S]*?)```/g;

// Alternatives, in priority order: inline code, link, bare URL, bold,
// italic, strike, @mention. Emphasis markers must hug non-space text and sit on word
// boundaries, so snake_case_names and 2*3*4 stay plain.
const INLINE =
  /`([^`\n]+)`|\[([^\]\n]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+|videocall:\/\/join)\)|(https?:\/\/[^\s<]+[^\s<.,;:!?)\]'"])|(?<![\w*])\*(\S(?:[^*\n]*\S)?)\*(?![\w*])|(?<![\w_])_(\S(?:[^_\n]*\S)?)_(?![\w_])|(?<![\w~])~(\S(?:[^~\n]*\S)?)~(?![\w~])|(?<![\w@])@([A-Za-z0-9._-]*[A-Za-z0-9_])/g;

// The link target of the "Join call" button in a video call announcement
// (posted by the server; see business-logic/discussions/video-call.ts).
const VIDEO_CALL_LINK = 'videocall://join';

const renderInline = (
  text: string,
  keyPrefix: string,
  joinVideoCall?: () => void
): React.ReactNode[] => {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(INLINE)) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const key = `${keyPrefix}-${match.index}`;
    const [, code, linkLabel, linkUrl, bareUrl, bold, italic, strike, mention] =
      match;

    if (code !== undefined) {
      nodes.push(
        <code className="discussion-md-code" key={key}>
          {code}
        </code>
      );
    } else if (linkLabel !== undefined && linkUrl === VIDEO_CALL_LINK) {
      // Only people who can join get the button; others see just the label.
      nodes.push(
        joinVideoCall ? (
          <Button
            size="small"
            type="primary"
            icon={<VideoCameraOutlined />}
            onClick={joinVideoCall}
            key={key}
          >
            {linkLabel}
          </Button>
        ) : (
          linkLabel
        )
      );
    } else if (linkLabel !== undefined) {
      nodes.push(
        <a href={linkUrl} target="_blank" rel="noopener noreferrer" key={key}>
          {renderInline(linkLabel, key)}
        </a>
      );
    } else if (bareUrl !== undefined) {
      nodes.push(
        <a href={bareUrl} target="_blank" rel="noopener noreferrer" key={key}>
          {bareUrl}
        </a>
      );
    } else if (bold !== undefined) {
      nodes.push(<strong key={key}>{renderInline(bold, key)}</strong>);
    } else if (italic !== undefined) {
      nodes.push(<em key={key}>{renderInline(italic, key)}</em>);
    } else if (strike !== undefined) {
      nodes.push(<del key={key}>{renderInline(strike, key)}</del>);
    } else if (mention !== undefined) {
      nodes.push(
        <span className="discussion-md-mention" key={key}>
          @{mention}
        </span>
      );
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
};

interface Props {
  text: string;
}

const MessageText = ({ text }: Props) => {
  const joinVideoCall = useContext(DiscussionActionsContext)?.joinVideoCall;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(CODE_BLOCK)) {
    if (match.index > lastIndex) {
      nodes.push(...renderInline(text.slice(lastIndex, match.index), `t${lastIndex}`, joinVideoCall));
    }
    nodes.push(
      <pre className="discussion-md-code-block" key={`b${match.index}`}>
        {match[1].replace(/\n$/, '')}
      </pre>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    nodes.push(...renderInline(text.slice(lastIndex), `t${lastIndex}`, joinVideoCall));
  }

  return <div className="discussion-message-text">{nodes}</div>;
};

export default MessageText;
