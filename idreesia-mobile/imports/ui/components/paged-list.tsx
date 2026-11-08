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
  /**
   * Shown on the right of the result count, e.g. a filter toggle. It stays
   * on show when there are no results, so the filter can be undone.
   */
  countExtra?: ReactNode;
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
  countExtra,
}: Props<TItem>) => {
  const { items, totalResults, hasMore, loading, error, loadMore, refresh } = paged;

  const count = (
    <p className="paged-list-count">
      {totalResults.toLocaleString()} {itemsLabel}
    </p>
  );
  const countRow = countExtra ? (
    <div className="paged-list-count-row">
      {count}
      {countExtra}
    </div>
  ) : (
    count
  );

  if (loading) return <PageLoading />;
  if (error) return <PageError error={error} onRetry={refresh} />;
  if (items.length === 0) {
    const empty = <PageEmpty description={emptyDescription} title={emptyTitle} />;
    return countExtra ? (
      <>
        {countRow}
        {empty}
      </>
    ) : (
      empty
    );
  }

  return (
    <PullToRefresh onRefresh={refresh}>
      {countRow}
      <List mode="card">
        {items.map(item => (
          <React.Fragment key={getKey(item)}>{renderItem(item)}</React.Fragment>
        ))}
      </List>
      <InfiniteScroll hasMore={hasMore} loadMore={loadMore} />
    </PullToRefresh>
  );
};
