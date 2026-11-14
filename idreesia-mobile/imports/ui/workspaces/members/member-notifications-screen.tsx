import React from 'react';
import { Button, List } from 'antd-mobile';
import { BellOutline } from 'antd-mobile-icons';

import { Page, PageEmpty, PageError, PageLoading } from '../../layout';
import { useParams } from '../../router';
import { WorkspacesPaths } from '../paths';
import { useNotificationsFeed } from '../use-notifications-feed';
import { formatDateTime } from '../polls/format';
import { MOBILE_COMMITTEE_MEMBER_NOTIFICATIONS } from './gql';

/**
 * A workspace's membership notifications. Opening it marks the unread ones
 * read; they stay tinted until the user leaves, so it's clear which
 * ones just arrived.
 */
export const MemberNotificationsScreen = () => {
  const { committeeId } = useParams<{ committeeId: string }>();
  const { notifications, isLoading, error, hasMore, loadingMore, loadMore, refresh } =
    useNotificationsFeed(MOBILE_COMMITTEE_MEMBER_NOTIFICATIONS, committeeId, 'members');

  let content;
  if (isLoading) {
    content = <PageLoading />;
  } else if (error) {
    content = <PageError error={error} onRetry={refresh} />;
  } else if (notifications.length === 0) {
    content = (
      <PageEmpty
        description="Changes to this workspace's members will show up here."
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
              description={formatDateTime(notification.createdAt)}
              // `isRead` is what the server sent, so unread ones stay tinted until
              // the user leaves, even though they are marked read on opening.
              className={notification.isRead ? undefined : 'member-notification-unread'}
            >
              <span className="member-notification-text">{notification.eventDetails}</span>
            </List.Item>
          ))}
        </List>
        {hasMore && (
          <div className="member-notifications-more">
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
      backTo={WorkspacesPaths.committeeMembers(committeeId)}
      title="Notifications"
      onRefresh={refresh}
    >
      {content}
    </Page>
  );
};
