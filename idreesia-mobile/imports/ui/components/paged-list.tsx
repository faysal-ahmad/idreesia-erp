import React, { type ReactNode } from 'react';
import { InfiniteScroll, List, PullToRefresh } from 'antd-mobile';

import { PageEmpty, PageError, PageLoading } from '../layout';

interface Props<TItem> {
  /** Result of usePagedQuery(). */
  paged: {
    items: TItem[];
    totalResults: number;
    hasMore: boolean;
    loading: boolean;
    error?: unknown;
    loadMore: () => Promise<void>;
    refresh: () => Promise<void>;
  };
  getKey: (item: TItem) => string;
  /** Renders one row, normally a <List.Item>. */
  renderItem: (item: TItem) => ReactNode;
  /** Shown when there are no results, e.g. "No visitors found". */
  emptyTitle: string;
  emptyDescription?: ReactNode;
  /** Noun for the result count, e.g. "visitors". */
  itemsLabel: string;
}

/**
 * The list-screen body from docs/mobile-ui-design-guidelines.md: pull to
 * refresh, card list, infinite scroll, and the standard loading / empty /
 * error states. Pair with usePagedQuery().
 */
export const PagedList = <TItem,>({
  paged,
  getKey,
  renderItem,
  emptyTitle,
  emptyDescription,
  itemsLabel,
}: Props<TItem>) => {
  const { items, totalResults, hasMore, loading, error, loadMore, refresh } = paged;

  if (loading) return <PageLoading />;
  if (error) return <PageError error={error} onRetry={refresh} />;
  if (items.length === 0) {
    return <PageEmpty description={emptyDescription} title={emptyTitle} />;
  }

  return (
    <PullToRefresh onRefresh={refresh}>
      <p className="paged-list-count">
        {totalResults.toLocaleString()} {itemsLabel}
      </p>
      <List mode="card">
        {items.map(item => (
          <React.Fragment key={getKey(item)}>{renderItem(item)}</React.Fragment>
        ))}
      </List>
      <InfiniteScroll hasMore={hasMore} loadMore={loadMore} />
    </PullToRefresh>
  );
};
