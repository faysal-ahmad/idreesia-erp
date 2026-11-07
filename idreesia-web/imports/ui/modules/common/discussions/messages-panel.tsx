import React, { useEffect, useMemo, useState } from 'react';
import { Empty, Spin } from 'antd';

import MessageList from './message-list';
import SidePanel from './side-panel';
import type { DiscussionMessage } from './types';

interface Props {
  title: string;
  emptyText: string;
  load(): Promise<DiscussionMessage[]>;
  /** Changes when the list may have changed (e.g. a message was pinned). */
  reloadKey: string;
  /** The discussion's current messages, so listed ones show live changes. */
  latest: Map<string, DiscussionMessage>;
  onClose(): void;
  widthPercent: number;
  onResize(widthPercent: number): void;
}

/** A side panel listing some of the discussion's messages (pinned, starred). */
const MessagesPanel = ({
  title,
  emptyText,
  load,
  reloadKey,
  latest,
  onClose,
  widthPercent,
  onResize,
}: Props) => {
  const [listed, setListed] = useState<DiscussionMessage[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    load()
      .then(result => {
        if (cancelled) return;
        setListed(result);
        setError(null);
      })
      .catch((loadError: Error) => {
        if (!cancelled) setError(loadError.message);
      });
    return () => {
      cancelled = true;
    };
  }, [load, reloadKey]);

  // Prefer the discussion's copy of a message: it has the latest edits and
  // reactions.
  const messages = useMemo(
    () => (listed ?? []).map(message => latest.get(message._id) ?? message),
    [listed, latest]
  );

  let body: React.ReactNode;
  if (error) {
    body = (
      <div className="discussion-state">
        <Empty description={`Could not load the messages: ${error}`} />
      </div>
    );
  } else if (listed === null) {
    body = (
      <div className="discussion-state">
        <Spin />
      </div>
    );
  } else {
    body = (
      <MessageList
        messages={messages}
        scrollToBottomKey={0}
        inThread
        emptyText={emptyText}
        showJump
      />
    );
  }

  return (
    <SidePanel
      title={title}
      onClose={onClose}
      widthPercent={widthPercent}
      onResize={onResize}
    >
      {body}
    </SidePanel>
  );
};

export default MessagesPanel;
