import React from 'react';
import { Button, List } from 'antd-mobile';
import { BellOutline } from 'antd-mobile-icons';

import { Page, PageEmpty, PageError, PageLoading } from '../../layout';
import { useHistory, useParams } from '../../router';
import { WorkspacesPaths } from '../paths';
import { useNotificationsFeed } from '../use-notifications-feed';
import { formatDateTime } from './format';
import { MOBILE_COMMITTEE_POLL_NOTIFICATIONS } from './gql';

/**
 * A workspace's poll notifications. Tapping one opens its poll. Opening it marks the unread ones
 * read; they stay tinted until the user leaves, so it's clear which
 * ones just arrived.
 */
export const PollNotificationsScreen = () => {
  const { committeeId } = useParams<{ committeeId: string }>();
  const { notifications, isLoading, error, hasMore, loadingMore, loadMore, refresh } =
    useNotificationsFeed(MOBILE_COMMITTEE_POLL_NOTIFICATIONS, committeeId, 'polls');
  const history = useHistory();

  let content;
  if (isLoading) {
    content = <PageLoading />;
  } else if (error) {
    content = <PageError error={error} onRetry={refresh} />;
  } else if (notifications.length === 0) {
    content = (
      <PageEmpty
        description="Cancelled polls and polls that closed early will show up here."
        icon={<BellOutline />}
        title="No notifications"
      />
    );
  } else {
    content = (
      <>
        <List mode="card">
          {notifications.map(notification => (
            <List.Item
              key={notification._id}
              onClick={() =>
                notification.entityId &&
                history.push(WorkspacesPaths.committeePoll(committeeId, notification.entityId))
              }
              description={formatDateTime(notification.createdAt)}
              // `isRead` is what the server sent, so unread ones stay tinted until
              // the user leaves, even though they are marked read on opening.
              className={notification.isRead ? undefined : 'poll-notification-unread'}
            >
              <span className="poll-notification-text">{notification.eventDetails}</span>
            </List.Item>
          ))}
        </List>
        {hasMore && (
          <div className="poll-notifications-more">
            <Button fill="none" loading={loadingMore} onClick={loadMore}>
              Load more
            </Button>
          </div>
        )}
      </>
    );
  }

  return (
    <Page
      backTo={WorkspacesPaths.committeePolls(committeeId)}
      title="Notifications"
      onRefresh={refresh}
    >
      {content}
    </Page>
  );
};
