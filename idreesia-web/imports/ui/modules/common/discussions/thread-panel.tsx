import React, { useState } from 'react';

import Composer from './composer';
import MessageList, { type MessageListFocus } from './message-list';
import SidePanel from './side-panel';
import type { DiscussionMessage } from './types';

interface Props {
  parent: DiscussionMessage;
  replies: DiscussionMessage[];
  canPost: boolean;
  onSend(text: string): Promise<void>;
  onUpload(file: File): Promise<void>;
  onClose(): void;
  widthPercent: number;
  onResize(widthPercent: number): void;
  /** A reply to scroll to and highlight. */
  focus?: MessageListFocus | null;
}

/** A thread beside the main list: its parent, the replies and a composer. */
const ThreadPanel = ({
  parent,
  replies,
  canPost,
  onSend,
  onUpload,
  onClose,
  widthPercent,
  onResize,
  focus = null,
}: Props) => {
  const [scrollToBottomKey, setScrollToBottomKey] = useState(0);

  const afterPost = async (post: Promise<void>) => {
    await post;
    setScrollToBottomKey(key => key + 1);
  };

  return (
    <SidePanel
      title="Thread"
      onClose={onClose}
      widthPercent={widthPercent}
      onResize={onResize}
    >
      <MessageList
        messages={[parent, ...replies]}
        scrollToBottomKey={scrollToBottomKey}
        inThread
        focus={focus}
      />
      <Composer
        canPost={canPost}
        onSend={text => afterPost(onSend(text))}
        onUpload={file => afterPost(onUpload(file))}
        placeholder="Reply in thread… (Enter to send, @ to mention)"
      />
    </SidePanel>
  );
};

export default ThreadPanel;
