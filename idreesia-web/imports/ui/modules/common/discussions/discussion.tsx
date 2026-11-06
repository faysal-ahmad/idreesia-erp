import React, { useState } from 'react';
import { Button, Empty, Spin } from 'antd';
import { SyncOutlined } from '@ant-design/icons';

import Composer from './composer';
import { DiscussionProviderContext } from './discussion-context';
import MessageList from './message-list';
import type { DiscussionDataProvider } from './types';
import useDiscussion from './use-discussion';

interface Props {
  provider: DiscussionDataProvider;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
}

/**
 * A discussion: its messages, kept current by polling, and a composer for
 * text and files. All data comes from `provider`, so this works for any
 * host (committees, teams, ...).
 */
const Discussion = ({ provider, title, subtitle }: Props) => {
  const {
    messages,
    canPost,
    loading,
    error,
    refresh,
    sendMessage,
    uploadFile,
  } = useDiscussion(provider);
  const [scrollToBottomKey, setScrollToBottomKey] = useState(0);

  const handleSend = async (text: string) => {
    await sendMessage(text);
    setScrollToBottomKey(key => key + 1);
  };

  const handleUpload = async (file: File) => {
    await uploadFile(file);
    setScrollToBottomKey(key => key + 1);
  };

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
      <>
        <MessageList messages={messages} scrollToBottomKey={scrollToBottomKey} />
        <Composer canPost={canPost} onSend={handleSend} onUpload={handleUpload} />
      </>
    );
  }

  return (
    <DiscussionProviderContext.Provider value={provider}>
      <div className="discussion">
        <div className="discussion-header">
          <div className="discussion-header-title">
            {title ? <div className="discussion-title">{title}</div> : null}
            {subtitle ? <div className="discussion-subtitle">{subtitle}</div> : null}
          </div>
          <Button
            icon={<SyncOutlined />}
            onClick={() => refresh()}
            title="Check for new messages"
            disabled={loading || !!error}
          />
        </div>
        {body}
      </div>
    </DiscussionProviderContext.Provider>
  );
};

export default Discussion;
