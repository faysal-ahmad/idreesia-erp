import React from 'react';
import { Button } from 'antd-mobile';
import { VideoOutline } from 'antd-mobile-icons';

/**
 * Renders the Rocket.Chat markdown subset messages use: ```code block```,
 * `inline code`, *bold*, _italic_, ~strike~, [label](url) links, bare
 * http(s) URLs and @mentions. A copy of the web's message-text.tsx. Builds
 * React elements only (never HTML strings), so message text can't inject
 * markup. Links open in the system browser.
 */

const CODE_BLOCK = /```(?:[^\n`]*\n)?([\s\S]*?)```/g;

// Alternatives, in priority order: inline code, link, bare URL, bold,
// italic, strike, @mention. Emphasis markers must hug non-space text and sit
// on word boundaries, so snake_case_names and 2*3*4 stay plain.
const INLINE =
  /`([^`\n]+)`|\[([^\]\n]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+|videocall:\/\/join)\)|(https?:\/\/[^\s<]+[^\s<.,;:!?)\]'"])|(?<![\w*])\*(\S(?:[^*\n]*\S)?)\*(?![\w*])|(?<![\w_])_(\S(?:[^_\n]*\S)?)_(?![\w_])|(?<![\w~])~(\S(?:[^~\n]*\S)?)~(?![\w~])|(?<![\w@])@([A-Za-z0-9._-]*[A-Za-z0-9_])/g;

// The link target of the "Join call" button in a video call announcement
// (posted by the server; the web's message-text.tsx renders the same one).
const VIDEO_CALL_LINK = 'videocall://join';

const renderInline = (text: string, keyPrefix: string, onJoinVideoCall?: () => void): React.ReactNode[] => {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(INLINE)) {
    const index = match.index ?? 0;
    if (index > lastIndex) nodes.push(text.slice(lastIndex, index));
    const key = `${keyPrefix}-${index}`;
    const [, code, linkLabel, linkUrl, bareUrl, bold, italic, strike, mention] = match;

    if (code !== undefined) {
      nodes.push(
        <code className="discussion-md-code" key={key}>
          {code}
        </code>,
      );
    } else if (linkLabel !== undefined && linkUrl === VIDEO_CALL_LINK) {
      // Only people who can join get the button; others see just the label.
      nodes.push(
        onJoinVideoCall ? (
          <Button color="primary" key={key} size="small" onClick={onJoinVideoCall}>
            <VideoOutline /> {linkLabel}
          </Button>
        ) : (
          linkLabel
        ),
      );
    } else if (linkLabel !== undefined) {
      nodes.push(
        <a href={linkUrl} key={key} rel="noopener noreferrer" target="_blank">
          {renderInline(linkLabel, key)}
        </a>,
      );
    } else if (bareUrl !== undefined) {
      nodes.push(
        <a href={bareUrl} key={key} rel="noopener noreferrer" target="_blank">
          {bareUrl}
        </a>,
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
        </span>,
      );
    }
    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
};

export const MessageText = ({ text, onJoinVideoCall }: { text: string; onJoinVideoCall?: () => void }) => {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(CODE_BLOCK)) {
    const index = match.index ?? 0;
    if (index > lastIndex) nodes.push(...renderInline(text.slice(lastIndex, index), `t${lastIndex}`, onJoinVideoCall));
    nodes.push(
      <pre className="discussion-md-code-block" key={`b${index}`}>
        {match[1].replace(/\n$/, '')}
      </pre>,
    );
    lastIndex = index + match[0].length;
  }
  if (lastIndex < text.length) nodes.push(...renderInline(text.slice(lastIndex), `t${lastIndex}`, onJoinVideoCall));

  return <div className="discussion-bubble-text">{nodes}</div>;
};
