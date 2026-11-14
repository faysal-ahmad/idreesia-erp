import React from 'react';
import { Button, List } from 'antd-mobile';
import { BellOutline } from 'antd-mobile-icons';

import { Page, PageEmpty, PageError, PageLoading } from '../../layout';
import { useHistory, useParams } from '../../router';
import { WorkspacesPaths } from '../paths';
import { useNotificationsFeed } from '../use-notifications-feed';
import { formatDateTime } from '../polls/format';
import { MOBILE_COMMITTEE_DOCUMENT_NOTIFICATIONS } from './gql';

/**
 * A workspace's document notifications. Tapping one opens its document.
 * Opening it marks the unread ones read; they stay tinted until the user leaves, so it's clear which
 * ones just arrived.
 */
export const DocumentNotificationsScreen = () => {
  const { committeeId } = useParams<{ committeeId: string }>();
  const { notifications, isLoading, error, hasMore, loadingMore, loadMore, refresh } =
    useNotificationsFeed(MOBILE_COMMITTEE_DOCUMENT_NOTIFICATIONS, committeeId, 'dms');
  const history = useHistory();

  let content;
  if (isLoading) {
    content = <PageLoading />;
  } else if (error) {
    content = <PageError error={error} onRetry={refresh} />;
  } else if (notifications.length === 0) {
    content = (
      <PageEmpty
        description="New documents, new versions and lock changes will show up here."
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
                history.push(WorkspacesPaths.committeeDocument(committeeId, notification.entityId))
              }
              description={formatDateTime(notification.createdAt)}
              // `isRead` is what the server sent, so unread ones stay tinted until
              // the user leaves, even though they are marked read on opening.
              className={notification.isRead ? undefined : 'document-notification-unread'}
            >
              <span className="document-notification-text">{notification.eventDetails}</span>
            </List.Item>
          ))}
        </List>
        {hasMore && (
          <div className="document-notifications-more">
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
      backTo={WorkspacesPaths.committeeDocuments(committeeId)}
      title="Notifications"
      onRefresh={refresh}
    >
      {content}
    </Page>
  );
};
