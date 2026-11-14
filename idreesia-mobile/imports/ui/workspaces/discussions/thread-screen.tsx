import React, { useEffect, useMemo, useState } from 'react';

import { MessageComposer } from '../../components';
import { Page, PageError, PageLoading } from '../../layout';
import { useParams } from '../../router';
import { useDiscussionContext } from './discussion-context';
import { DiscussionMessageList } from './discussion-message-list';
import { useMessageActions } from './use-message-actions';

/**
 * A thread: the message it started from, then its replies. New replies come
 * in with the discussion's regular sync; posting here replies in the thread.
 */
export const ThreadScreen = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const { scope, canPost, members, discussion, actions } = useDiscussionContext();
  const messageActions = useMessageActions({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [attempt, setAttempt] = useState(0);

  const { loadThread } = discussion;
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    loadThread(threadId)
      .catch(loadError => {
        if (!cancelled) setError(loadError);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [loadThread, threadId, attempt]);

  // The parent sorts first: replies are always newer.
  const messages = useMemo(
    () => discussion.messages.filter(message => message._id === threadId || message.threadId === threadId),
    [discussion.messages, threadId],
  );

  let content;
  if (loading && messages.length === 0) {
    content = <PageLoading />;
  } else if (error && messages.length === 0) {
    content = <PageError error={error} onRetry={() => setAttempt(value => value + 1)} />;
  } else {
    content = (
      <DiscussionMessageList
        emptyDescription="This message may have been deleted."
        emptyTitle="Thread not found"
        messages={messages}
        {...messageActions.handlers}
      />
    );
  }

  return (
    <Page
      backTo={scope.paths.main}
      footer={
        canPost && messages.length > 0 ? (
          <MessageComposer
            mentionCandidates={members}
            placeholder="Reply in thread…"
            onSendFile={(file, fileName) => actions.uploadFile(file, fileName, threadId)}
            onSendText={text => actions.sendMessage(text, threadId)}
          />
        ) : undefined
      }
      title="Thread"
    >
      {content}
      {messageActions.elements}
    </Page>
  );
};
