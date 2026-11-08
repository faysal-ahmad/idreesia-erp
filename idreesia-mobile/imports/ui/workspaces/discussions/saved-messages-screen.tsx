import React from 'react';
import { useQuery } from '@apollo/client/react';
import { PullToRefresh } from 'antd-mobile';
import { StarOutline, TagOutline } from 'antd-mobile-icons';

import { Page, PageEmpty, PageError, PageLoading } from '../../layout';
import { WorkspacesPaths } from '../paths';
import { useDiscussionContext } from './discussion-context';
import { toDiscussionMessages } from './discussion-types';
import { MOBILE_WORKSPACE_DISCUSSION_PINNED_MESSAGES, MOBILE_WORKSPACE_DISCUSSION_STARRED_MESSAGES } from './gql';
import { MessageResultsList } from './message-results-list';
import { useOpenMessage } from './use-open-message';

interface Props {
  kind: 'pinned' | 'starred';
}

/**
 * Pinned messages (pinned by coordinators, seen by everyone) or the user's
 * own starred messages, newest first.
 */
export const SavedMessagesScreen = ({ kind }: Props) => {
  const { committeeId } = useDiscussionContext();
  const openMessage = useOpenMessage();
  const pinned = useQuery(MOBILE_WORKSPACE_DISCUSSION_PINNED_MESSAGES, {
    variables: { committeeId },
    fetchPolicy: 'network-only',
    skip: kind !== 'pinned',
  });
  const starred = useQuery(MOBILE_WORKSPACE_DISCUSSION_STARRED_MESSAGES, {
    variables: { committeeId },
    fetchPolicy: 'network-only',
    skip: kind !== 'starred',
  });
  const query = kind === 'pinned' ? pinned : starred;
  const messages = toDiscussionMessages(
    kind === 'pinned'
      ? pinned.data?.workspaceDiscussionPinnedMessages
      : starred.data?.workspaceDiscussionStarredMessages,
  ).reverse();

  const refresh = () => query.refetch().then(
    () => undefined,
    () => undefined,
  );

  let content;
  if (query.loading && !query.data) {
    content = <PageLoading />;
  } else if (query.error && !query.data) {
    content = <PageError error={query.error} onRetry={refresh} />;
  } else if (messages.length === 0) {
    content = (
      <PullToRefresh onRefresh={refresh}>
        {kind === 'pinned' ? (
          <PageEmpty
            description="Coordinators can pin important messages so everyone can find them here."
            icon={<TagOutline />}
            title="No pinned messages"
          />
        ) : (
          <PageEmpty
            description="Long-press a message and choose Star to keep it here. Only you see your stars."
            icon={<StarOutline />}
            title="No starred messages"
          />
        )}
      </PullToRefresh>
    );
  } else {
    content = (
      <PullToRefresh onRefresh={refresh}>
        <MessageResultsList messages={messages} onOpen={openMessage} />
      </PullToRefresh>
    );
  }

  return (
    <Page
      backTo={WorkspacesPaths.committeeDiscussions(committeeId)}
      title={kind === 'pinned' ? 'Pinned messages' : 'Starred messages'}
    >
      {content}
    </Page>
  );
};
