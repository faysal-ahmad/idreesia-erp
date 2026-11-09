import React, { useEffect, useRef, useState } from 'react';
import { useApolloClient, useMutation, useQuery } from '@apollo/client/react';
import { Button, List } from 'antd-mobile';
import { BellOutline } from 'antd-mobile-icons';

import { Page, PageEmpty, PageError, PageLoading, showError } from '../../layout';
import { useParams } from '../../router';
import { MOBILE_MY_NOTIFICATION_COUNTS } from '../gql';
import { WorkspacesPaths } from '../paths';
import { formatDateTime } from '../polls/format';
import { MOBILE_COMMITTEE_MEMBER_NOTIFICATIONS, MOBILE_MARK_NOTIFICATIONS_READ } from './gql';

// The first load shows this many, or every unread one if there are more;
// "Load more" adds this many each time.
const PAGE_SIZE = 20;

/**
 * A workspace's membership notifications. Opening it marks the unread ones
 * read; they stay tinted until the user leaves, so it's clear which
 * ones just arrived.
 */
export const MemberNotificationsScreen = () => {
  const { committeeId } = useParams<{ committeeId: string }>();
  const client = useApolloClient();

  // How many are unread decides the size of the first load. Fetched fresh
  // (it's tiny), and the size is fixed from then on, because opening the
  // screen marks them read and changes the count. A failed fetch (e.g.
  // offline) falls back to PAGE_SIZE.
  const counts = useQuery(MOBILE_MY_NOTIFICATION_COUNTS, { fetchPolicy: 'network-only' });
  const countsSettled = !counts.loading;
  const unread = (counts.data?.myNotificationCounts ?? [])
    .filter(row => row?.committeeId === committeeId && row.module === 'members')
    .reduce((total, row) => total + (row?.unreadCount ?? 0), 0);
  const [firstLimit, setFirstLimit] = useState<number | null>(null);
  useEffect(() => {
    if (countsSettled && firstLimit == null) setFirstLimit(Math.max(PAGE_SIZE, unread));
  }, [countsSettled, firstLimit, unread]);

  const { data, loading, error, refetch } = useQuery(MOBILE_COMMITTEE_MEMBER_NOTIFICATIONS, {
    variables: { committeeId, limit: firstLimit ?? PAGE_SIZE },
    skip: firstLimit == null,
    fetchPolicy: 'cache-and-network',
  });
  const [markRead] = useMutation(MOBILE_MARK_NOTIFICATIONS_READ, {
    refetchQueries: [MOBILE_MY_NOTIFICATION_COUNTS],
  });

  // Pages loaded with "Load more", after the first load.
  const [more, setMore] = useState<NonNullable<typeof data>['myNotifications']>([]);
  const [lastPageFull, setLastPageFull] = useState<boolean | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const firstPage = (data?.myNotifications ?? []).filter(
    (notification): notification is NonNullable<typeof notification> & { _id: string } =>
      notification?._id != null,
  );
  const firstIds = new Set(firstPage.map(notification => notification._id));
  const notifications = [
    ...firstPage,
    ...(more ?? []).filter(
      (notification): notification is NonNullable<typeof notification> & { _id: string } =>
        notification?._id != null && !firstIds.has(notification._id),
    ),
  ];
  // Until "Load more" is used, whether there may be more is whether the first
  // load came back full.
  const hasMore = lastPageFull ?? (firstLimit != null && firstPage.length >= firstLimit);

  // Ids already sent, so a re-render or refetch doesn't send them again.
  const marked = useRef(new Set<string>());
  useEffect(() => {
    const ids = notifications
      .filter(notification => !notification.isRead && !marked.current.has(notification._id))
      .map(notification => notification._id);
    if (ids.length === 0) return;
    ids.forEach(id => marked.current.add(id));
    markRead({ variables: { ids } }).catch(() => {
      // Best effort: they stay unread and are marked the next time.
      ids.forEach(id => marked.current.delete(id));
    });
  }, [notifications, markRead]);

  const loadMore = () => {
    setLoadingMore(true);
    client
      .query({
        query: MOBILE_COMMITTEE_MEMBER_NOTIFICATIONS,
        variables: { committeeId, limit: PAGE_SIZE, offset: notifications.length },
        fetchPolicy: 'network-only',
      })
      .then(result => {
        const page = result.data?.myNotifications ?? [];
        setMore(previous => [...(previous ?? []), ...page]);
        setLastPageFull(page.length >= PAGE_SIZE);
      })
      .catch(failure => showError(failure, 'Could not load more notifications.'))
      .finally(() => setLoadingMore(false));
  };

  const refresh = () =>
    refetch().then(
      () => {
        // Back to the first load; "Load more" starts over from there.
        setMore([]);
        setLastPageFull(null);
      },
      () => undefined,
    );

  let content;
  if ((firstLimit == null || loading) && !data) {
    content = <PageLoading />;
  } else if (error && !data) {
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
