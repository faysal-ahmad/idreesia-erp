import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Empty, Space, Spin, Tooltip } from 'antd';
import {
  PushpinOutlined,
  SearchOutlined,
  StarOutlined,
  SyncOutlined,
} from '@ant-design/icons';

import { message as toast, modal } from '/imports/ui/antd-feedback';

import Composer from './composer';
import {
  DiscussionActionsContext,
  type DiscussionActions,
} from './discussion-actions';
import { DiscussionProviderContext } from './discussion-context';
import MessageList, { type MessageListFocus } from './message-list';
import MessagesPanel from './messages-panel';
import SearchPanel from './search-panel';
import { SIDE_PANEL_DEFAULT_PERCENT } from './side-panel';
import ThreadPanel from './thread-panel';
import type { DiscussionDataProvider } from './types';
import useDiscussion from './use-discussion';

interface Props {
  provider: DiscussionDataProvider;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
}

// What the side panel shows, if anything.
type SidePanelState =
  | { kind: 'thread'; threadId: string }
  | { kind: 'pinned' }
  | { kind: 'starred' }
  | { kind: 'search' }
  | null;

const showError = (error: unknown) => {
  toast.error((error as Error)?.message || 'Something went wrong.', 5);
};

/**
 * A discussion: its messages, kept current by polling, a composer for text
 * and files, message actions (reactions, threads, pin, star, edit, delete)
 * and a thread panel. All data comes from `provider`, so this works for any
 * host (committees, teams, ...).
 */
const Discussion = ({ provider, title, subtitle }: Props) => {
  const {
    messages,
    canPost,
    canPin,
    loading,
    error,
    hasOlder,
    loadingOlder,
    operations,
  } = useDiscussion(provider);
  const [scrollToBottomKey, setScrollToBottomKey] = useState(0);
  // Message to scroll to and highlight, in the main list or the thread.
  const [mainFocus, setMainFocus] = useState<MessageListFocus | null>(null);
  const [threadFocus, setThreadFocus] = useState<MessageListFocus | null>(null);
  const [sidePanel, setSidePanel] = useState<SidePanelState>(null);
  const threadId = sidePanel?.kind === 'thread' ? sidePanel.threadId : null;
  // Kept while the discussion is open, so reopening a panel keeps its size.
  const [sidePanelWidth, setSidePanelWidth] = useState(
    SIDE_PANEL_DEFAULT_PERCENT
  );
  const panelSizing = {
    widthPercent: sidePanelWidth,
    onResize: setSidePanelWidth,
  };

  // Thread replies live in their thread unless also sent to the main list.
  const mainMessages = useMemo(
    () => messages.filter(message => !message.threadId || message.showInMainList),
    [messages]
  );
  const threadParent = threadId
    ? messages.find(message => message._id === threadId) ?? null
    : null;
  const threadReplies = useMemo(
    () =>
      threadId ? messages.filter(message => message.threadId === threadId) : [],
    [messages, threadId]
  );

  // Close the thread when its parent message goes away (e.g. deleted).
  useEffect(() => {
    if (threadId && !loading && !threadParent) setSidePanel(null);
  }, [threadId, threadParent, loading]);

  useEffect(() => {
    setSidePanel(null);
  }, [provider]);

  // For the pinned/starred panels: live copies of listed messages, and keys
  // that change when a message is pinned/starred or unpinned/unstarred.
  const latestById = useMemo(
    () => new Map(messages.map(message => [message._id, message])),
    [messages]
  );
  const pinnedKey = messages
    .filter(message => message.isPinned)
    .map(message => message._id)
    .join(',');
  const starredKey = messages
    .filter(message => message.isStarred)
    .map(message => message._id)
    .join(',');
  const loadPinned = useCallback(() => provider.loadPinnedMessages(), [provider]);
  const loadStarred = useCallback(
    () => provider.loadStarredMessages(),
    [provider]
  );

  const handleSend = async (text: string) => {
    await operations.sendMessage(text);
    setScrollToBottomKey(key => key + 1);
  };

  const handleUpload = async (file: File) => {
    await operations.uploadFile(file);
    setScrollToBottomKey(key => key + 1);
  };

  const actions = useMemo<DiscussionActions>(
    () => ({
      canPost,
      canPin,
      react: (messageId, emoji, shouldReact) => {
        operations.reactToMessage(messageId, emoji, shouldReact).catch(showError);
      },
      setStarred: (messageId, starred) => {
        operations.setMessageStarred(messageId, starred).catch(showError);
      },
      setPinned: (messageId, pinned) => {
        operations.setMessagePinned(messageId, pinned).catch(showError);
      },
      edit: (messageId, text) =>
        operations
          .editMessage(messageId, text)
          .then(() => true)
          .catch(editError => {
            showError(editError);
            return false;
          }),
      remove: messageId => {
        modal.confirm({
          title: 'Delete this message?',
          content: 'It will be removed for everyone.',
          okText: 'Delete',
          okButtonProps: { danger: true },
          onOk: () => operations.deleteMessage(messageId).catch(showError),
        });
      },
      openThread: id => {
        setSidePanel({ kind: 'thread', threadId: id });
        operations.loadThread(id).catch(showError);
      },
      jumpTo: target => {
        // A thread reply lives in its thread: open it and highlight there.
        if (target.threadId && !target.showInMainList) {
          const parentId = target.threadId;
          setSidePanel({ kind: 'thread', threadId: parentId });
          operations
            .loadThread(parentId)
            .then(() => setThreadFocus({ messageId: target._id, key: Date.now() }))
            .catch(showError);
          return;
        }
        operations
          .ensureLoaded(target._id)
          .then(found => {
            if (found) {
              setMainFocus({ messageId: target._id, key: Date.now() });
            } else {
              toast.info('That message is too far back to show here.', 4);
            }
          })
          .catch(showError);
      },
    }),
    [canPost, canPin, operations]
  );

  let body: React.ReactNode;
  if (loading) {
    body = (
      <div className="discussion-state">
        <Spin />
      </div>
    );
  } else if (error) {
    body = (
      <div className="discussion-state">
        <Empty description={`Could not load the discussion: ${error}`} />
      </div>
    );
  } else {
    body = (
      <div className="discussion-body">
        <div className="discussion-main">
          <MessageList
            messages={mainMessages}
            scrollToBottomKey={scrollToBottomKey}
            hasOlder={hasOlder}
            loadingOlder={loadingOlder}
            onLoadOlder={() => {
              operations.loadOlder().catch(showError);
            }}
            focus={mainFocus}
          />
          <Composer canPost={canPost} onSend={handleSend} onUpload={handleUpload} />
        </div>
        {threadParent ? (
          <ThreadPanel
            parent={threadParent}
            replies={threadReplies}
            canPost={canPost}
            onSend={text => operations.sendMessage(text, threadParent._id)}
            onUpload={file => operations.uploadFile(file, threadParent._id)}
            onClose={() => setSidePanel(null)}
            focus={threadFocus}
            {...panelSizing}
          />
        ) : null}
        {sidePanel?.kind === 'pinned' ? (
          <MessagesPanel
            title="Pinned Messages"
            emptyText="No pinned messages."
            load={loadPinned}
            reloadKey={pinnedKey}
            latest={latestById}
            onClose={() => setSidePanel(null)}
            {...panelSizing}
          />
        ) : null}
        {sidePanel?.kind === 'search' ? (
          <SearchPanel
            latest={latestById}
            onClose={() => setSidePanel(null)}
            {...panelSizing}
          />
        ) : null}
        {sidePanel?.kind === 'starred' ? (
          <MessagesPanel
            title="Starred Messages"
            emptyText="You haven't starred any messages."
            load={loadStarred}
            reloadKey={starredKey}
            latest={latestById}
            onClose={() => setSidePanel(null)}
            {...panelSizing}
          />
        ) : null}
      </div>
    );
  }

  return (
    <DiscussionProviderContext.Provider value={provider}>
      <DiscussionActionsContext.Provider value={actions}>
        <div className="discussion">
          <div className="discussion-header">
            <div className="discussion-header-title">
              {title ? <div className="discussion-title">{title}</div> : null}
              {subtitle ? (
                <div className="discussion-subtitle">{subtitle}</div>
              ) : null}
            </div>
            <Space size={8}>
              <Tooltip title="Search messages">
                <Button
                  icon={<SearchOutlined />}
                  type={sidePanel?.kind === 'search' ? 'primary' : 'default'}
                  disabled={loading || !!error}
                  onClick={() =>
                    setSidePanel(current =>
                      current?.kind === 'search' ? null : { kind: 'search' }
                    )
                  }
                />
              </Tooltip>
              <Tooltip title="Pinned messages">
                <Button
                  icon={<PushpinOutlined />}
                  type={sidePanel?.kind === 'pinned' ? 'primary' : 'default'}
                  disabled={loading || !!error}
                  onClick={() =>
                    setSidePanel(current =>
                      current?.kind === 'pinned' ? null : { kind: 'pinned' }
                    )
                  }
                />
              </Tooltip>
              <Tooltip title="Starred messages">
                <Button
                  icon={<StarOutlined />}
                  type={sidePanel?.kind === 'starred' ? 'primary' : 'default'}
                  disabled={loading || !!error}
                  onClick={() =>
                    setSidePanel(current =>
                      current?.kind === 'starred' ? null : { kind: 'starred' }
                    )
                  }
                />
              </Tooltip>
              <Button
                icon={<SyncOutlined />}
                onClick={() => operations.refresh()}
                title="Check for new messages"
                disabled={loading || !!error}
              />
            </Space>
          </div>
          {body}
        </div>
      </DiscussionActionsContext.Provider>
    </DiscussionProviderContext.Provider>
  );
};

export default Discussion;
