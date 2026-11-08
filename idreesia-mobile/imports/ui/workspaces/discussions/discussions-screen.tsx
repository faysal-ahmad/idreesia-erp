import React, { useEffect, useMemo, useState } from 'react';
import { ActionSheet } from 'antd-mobile';
import { MoreOutline } from 'antd-mobile-icons';

import { MessageComposer } from '../../components';
import { Page, PageError, PageLoading, showInfo } from '../../layout';
import { useHistory } from '../../router';
import { WorkspacesPaths } from '../paths';
import { useDiscussionContext } from './discussion-context';
import { DiscussionMessageList, messageElementId } from './discussion-message-list';
import type { DiscussionMessage } from './discussion-types';
import { useMessageActions } from './use-message-actions';

// How long a message jumped to stays highlighted.
const HIGHLIGHT_MS = 2000;

interface Props {
  /** False while a screen opened from it (a thread, search…) is on top. */
  active: boolean;
}

/**
 * A committee's discussion (a Rocket.Chat group behind the ERP): the main
 * list of messages. Members read it; those with a chat account also post, as
 * themselves. Long-press a message for its actions.
 */
export const DiscussionsScreen = ({ active }: Props) => {
  const history = useHistory();
  const context = useDiscussionContext();
  const { committeeId, title, canPost, members, discussion, actions, focusId, requestFocus } = context;
  const [menuOpen, setMenuOpen] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  const openThread = (message: DiscussionMessage) =>
    history.push(WorkspacesPaths.committeeDiscussionThread(committeeId, message.threadId ?? message._id));
  const messageActions = useMessageActions({ onOpenThread: openThread });

  const mainList = useMemo(
    () => discussion.messages.filter(message => !message.threadId || message.showInMainList),
    [discussion.messages],
  );

  // Jumping to a message picked in search, pinned or starred: load it if it's
  // older than what's shown, then scroll to it and highlight it.
  const { ensureLoaded } = discussion;
  useEffect(() => {
    if (!active || !focusId) return;
    const messageId = focusId;
    // Clearing it re-runs this effect, so the jump below isn't tied to it.
    // The screen stays mounted (KeepAlive), so there's nothing to cancel.
    requestFocus(null);
    ensureLoaded(messageId)
      .then(found => {
        if (!found) {
          showInfo('That message is too far back to show here.');
          return;
        }
        // After the newly loaded messages have rendered.
        requestAnimationFrame(() => {
          document.getElementById(messageElementId(messageId))?.scrollIntoView({ block: 'center' });
          setHighlightId(messageId);
        });
      })
      .catch(() => undefined);
  }, [active, focusId, ensureLoaded, requestFocus]);

  useEffect(() => {
    if (!highlightId) return undefined;
    const timer = setTimeout(() => setHighlightId(null), HIGHLIGHT_MS);
    return () => clearTimeout(timer);
  }, [highlightId]);

  let content;
  let footer;
  if (context.infoLoading || (discussion.loading && discussion.messages.length === 0)) {
    content = <PageLoading />;
  } else if (context.infoError) {
    content = <PageError error={context.infoError} onRetry={context.retryInfo} />;
  } else if (discussion.error) {
    content = <PageError error={discussion.error} onRetry={discussion.retry} />;
  } else {
    content = (
      <DiscussionMessageList
        active={active}
        hasOlder={discussion.hasOlder}
        highlightId={highlightId}
        loadingOlder={discussion.loadingOlder}
        messages={mainList}
        onLoadOlder={discussion.loadOlder}
        {...messageActions.handlers}
      />
    );
    footer = canPost ? (
      <MessageComposer
        mentionCandidates={members}
        onSendFile={(file, fileName) => actions.uploadFile(file, fileName)}
        onSendText={text => actions.sendMessage(text)}
      />
    ) : (
      <p className="discussion-cannot-post">
        You need a chat account to post here. Ask an administrator to create one for you.
      </p>
    );
  }

  return (
    <Page
      backTo={WorkspacesPaths.root}
      footer={footer}
      right={<MoreOutline aria-label="More" className="discussion-nav-icon" onClick={() => setMenuOpen(true)} />}
      title={title ?? 'Discussions'}
    >
      {content}
      {messageActions.elements}
      <ActionSheet
        actions={[
          {
            key: 'search',
            text: 'Search messages',
            onClick: () => history.push(WorkspacesPaths.committeeDiscussionSearch(committeeId)),
          },
          {
            key: 'pinned',
            text: 'Pinned messages',
            onClick: () => history.push(WorkspacesPaths.committeeDiscussionPinned(committeeId)),
          },
          {
            key: 'starred',
            text: 'Starred messages',
            onClick: () => history.push(WorkspacesPaths.committeeDiscussionStarred(committeeId)),
          },
        ]}
        cancelText="Cancel"
        closeOnAction
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
    </Page>
  );
};
