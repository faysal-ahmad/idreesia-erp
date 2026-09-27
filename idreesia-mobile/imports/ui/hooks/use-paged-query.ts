import { useCallback, useEffect, useRef, useState } from 'react';
import type { OperationVariables, TypedDocumentNode } from '@apollo/client';
import { useApolloClient, useQuery } from '@apollo/client/react';

// Pages returned by the server's paged queries: { totalResults, data }.
export interface Page<TItem> {
  totalResults?: number | null;
  data?: Array<TItem | null> | null;
}

interface PagedFilter {
  pageIndex?: string | null;
  pageSize?: string | null;
}

interface Options<TData, TFilter, TItem> {
  /** The query's `filter` argument, without paging. */
  filter: TFilter;
  /** Picks the page out of the query result. */
  getPage: (data: TData) => Page<TItem> | null | undefined;
  /** Identifies an item, so a record never shows twice. */
  getKey: (item: TItem) => string | null | undefined;
  pageSize?: number;
}

const isPresent = <T>(value: T | null | undefined): value is T => value != null;

/**
 * Drives a server-paged query (the `pageIndex` / `pageSize` filter
 * convention used across the GraphQL API) as an infinitely scrolling list:
 * the first page is a normal cached query; later pages are appended by
 * loadMore(). Changing the filter starts again from the first page.
 */
export const usePagedQuery = <
  TData,
  TFilter extends object,
  TItem,
  TVariables extends OperationVariables & { filter?: (TFilter & PagedFilter) | null },
>(
  query: TypedDocumentNode<TData, TVariables>,
  { filter, getPage, getKey, pageSize = 20 }: Options<TData, TFilter, TItem>
) => {
  const client = useApolloClient();
  const filterKey = JSON.stringify(filter);
  const variablesFor = (pageIndex: number) =>
    ({ filter: { ...filter, pageIndex: String(pageIndex), pageSize: String(pageSize) } }) as TVariables;

  const { data, loading, error, refetch } = useQuery(query, {
    variables: variablesFor(0),
    notifyOnNetworkStatusChange: true,
  });

  // Pages after the first, for the current filter only. The next page index
  // lives in a ref so back-to-back loadMore() calls never fetch a page twice.
  const [morePages, setMorePages] = useState<TItem[][]>([]);
  const filterKeyRef = useRef(filterKey);
  const nextPageRef = useRef(1);
  const inFlightRef = useRef<Promise<void> | null>(null);
  useEffect(() => {
    filterKeyRef.current = filterKey;
    nextPageRef.current = 1;
    inFlightRef.current = null;
    setMorePages([]);
  }, [filterKey]);

  const firstPage = data ? getPage(data as TData) : null;
  const seen = new Set<string>();
  const items = [...(firstPage?.data ?? []), ...morePages.flat()]
    .filter(isPresent)
    .filter(item => {
      const key = getKey(item);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  const totalResults = firstPage?.totalResults ?? 0;
  const hasMore = Boolean(firstPage) && items.length < totalResults;

  const loadMore = useCallback(() => {
    if (inFlightRef.current) return inFlightRef.current;

    const requestedFor = filterKey;
    const pageIndex = nextPageRef.current;
    const request = client
      .query({ query, variables: variablesFor(pageIndex), fetchPolicy: 'network-only' })
      .then(result => {
        if (filterKeyRef.current !== requestedFor || !result.data) return;
        nextPageRef.current = pageIndex + 1;
        const page = getPage(result.data as TData);
        setMorePages(pages => [...pages, (page?.data ?? []).filter(isPresent)]);
      })
      .finally(() => {
        if (inFlightRef.current === request) inFlightRef.current = null;
      });
    inFlightRef.current = request;
    return request;
  }, [client, query, filterKey]);

  const refresh = useCallback(async () => {
    nextPageRef.current = 1;
    inFlightRef.current = null;
    setMorePages([]);
    await refetch();
  }, [refetch]);

  return {
    items,
    totalResults,
    hasMore,
    /** True only while the first page is loading (not during loadMore). */
    loading: loading && !firstPage,
    error: firstPage ? undefined : error,
    loadMore,
    refresh,
  };
};
