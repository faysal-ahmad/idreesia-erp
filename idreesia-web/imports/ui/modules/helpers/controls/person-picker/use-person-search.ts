import { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client/react';

import type {
  PersonPickerFilter,
  PersonPickerPageParams,
  PersonSearchSource,
  PickerPerson,
} from './types';

const DEFAULT_PAGE_SIZE = 20;

export interface PersonSearch {
  people: PickerPerson[];
  totalResults: number;
  loading: boolean;
  pageIndex: number;
  pageSize: number;
  filter: PersonPickerFilter;
  setPageParams(params: PersonPickerPageParams): void;
  refresh(): Promise<unknown>;
}

/**
 * Runs a picker search: keeps what was typed and the page, and queries the
 * source with them. Who can be found is up to the source's query.
 */
export function usePersonSearch(
  source: PersonSearchSource,
  { skip = false }: { skip?: boolean } = {}
): PersonSearch {
  const [filter, setFilter] = useState<PersonPickerFilter>({});
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const { data, loading, refetch } = useQuery(source.query, {
    variables: {
      ...source.variables,
      name: filter.name || undefined,
      cnicNumber: filter.cnicNumber || undefined,
      phoneNumber: filter.phoneNumber || undefined,
      pageIndex: String(pageIndex),
      pageSize: String(pageSize),
    },
    fetchPolicy: 'network-only',
    skip,
  });

  const page = data ? source.select(data) : null;
  const people = useMemo(
    () =>
      (page?.data ?? []).filter(
        (person): person is PickerPerson => person?._id != null
      ),
    [page]
  );

  const setPageParams = ({
    pageIndex: nextPageIndex,
    pageSize: nextPageSize,
    ...filterChanges
  }: PersonPickerPageParams) => {
    if (nextPageIndex != null) setPageIndex(Number(nextPageIndex));
    if (nextPageSize != null) setPageSize(Number(nextPageSize));
    if (Object.keys(filterChanges).length > 0) {
      setFilter(prev => ({ ...prev, ...filterChanges }));
    }
  };

  return {
    people,
    totalResults: page?.totalResults ?? 0,
    loading,
    pageIndex,
    pageSize,
    filter,
    setPageParams,
    refresh: refetch,
  };
}
