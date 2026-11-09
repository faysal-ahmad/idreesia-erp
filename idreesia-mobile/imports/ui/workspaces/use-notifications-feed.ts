import { useEffect, useRef, useState } from 'react';
import { useApolloClient, useMutation, useQuery } from '@apollo/client/react';
import type { TypedDocumentNode } from '@apollo/client';

import { showError } from '../layout';
import { MOBILE_MY_NOTIFICATION_COUNTS } from './gql';
import { MOBILE_MARK_NOTIFICATIONS_READ } from './members/gql';

// The first load shows this many, or every unread one if there are more;
// "Load more" adds this many each time.
const PAGE_SIZE = 20;

type FeedVariables = { committeeId: string; limit: number; offset?: number | null };

type FeedRow = { _id: string | null; isRead: boolean | null };

type FeedQuery<Row> = TypedDocumentNode<
  { myNotifications: Array<Row | null> | null },
  FeedVariables
>;

type Item<Row extends FeedRow> = Row & { _id: string };

const hasId = <Row extends FeedRow>(row: Row | null | undefined): row is Item<Row> =>
  row?._id != null;

/**
 * Loads a workspace module's notifications for the signed-in user: the first
 * load, "Load more" paging, pull-to-refresh, and marking the unread ones read
 * on opening. `isRead` stays what the server sent, so unread ones remain
 * tinted until the user leaves.
 *
 * `query` must take `committeeId`, `limit` and `offset`, and select at least
 * `_id` and `isRead`.
 */
export const useNotificationsFeed = <Row extends FeedRow>(
  query: FeedQuery<Row>,
  committeeId: string,
  module: string,
) => {
  const client = useApolloClient();

  // How many are unread decides the size of the first load. Fetched fresh
  // (it's tiny), and the size is fixed from then on, because opening the
  // screen marks them read and changes the count. A failed fetch (e.g.
  // offline) falls back to PAGE_SIZE.
  const counts = useQuery(MOBILE_MY_NOTIFICATION_COUNTS, { fetchPolicy: 'network-only' });
  const countsSettled = !counts.loading;
  const unread = (counts.data?.myNotificationCounts ?? [])
    .filter(row => row?.committeeId === committeeId && row.module === module)
    .reduce((total, row) => total + (row?.unreadCount ?? 0), 0);
  const [firstLimit, setFirstLimit] = useState<number | null>(null);
  useEffect(() => {
    if (countsSettled && firstLimit == null) setFirstLimit(Math.max(PAGE_SIZE, unread));
  }, [countsSettled, firstLimit, unread]);

  const { data, loading, error, refetch } = useQuery(query, {
    variables: { committeeId, limit: firstLimit ?? PAGE_SIZE },
    skip: firstLimit == null,
    fetchPolicy: 'cache-and-network',
  });
  const [markRead] = useMutation(MOBILE_MARK_NOTIFICATIONS_READ, {
    refetchQueries: [MOBILE_MY_NOTIFICATION_COUNTS],
  });

  // Pages loaded with "Load more", after the first load.
  const [more, setMore] = useState<Array<Row | null>>([]);
  const [lastPageFull, setLastPageFull] = useState<boolean | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const firstPage = (data?.myNotifications ?? []).filter(hasId);
  const firstIds = new Set(firstPage.map(notification => notification._id));
  const notifications: Array<Item<Row>> = [
    ...firstPage,
    ...more.filter(hasId).filter(notification => !firstIds.has(notification._id)),
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
        query,
        variables: { committeeId, limit: PAGE_SIZE, offset: notifications.length },
        fetchPolicy: 'network-only',
      })
      .then(result => {
        const page = result.data?.myNotifications ?? [];
        setMore(previous => [...previous, ...page]);
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

  return {
    notifications,
    // True until the first page (or cached data) is available.
    isLoading: (firstLimit == null || loading) && !data,
    // Only set when there is nothing to show.
    error: error && !data ? error : undefined,
    hasMore,
    loadingMore,
    loadMore,
    refresh,
  };
};
