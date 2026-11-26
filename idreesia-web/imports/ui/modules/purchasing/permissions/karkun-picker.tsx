import React, { useState } from 'react';
import type { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';

import {
  KarkunSelectionList,
  type KarkunSelectionFilter,
  type KarkunSelectionItem,
  type KarkunSelectionPageParams,
} from '/imports/ui/modules/helpers/controls';

import { PURCHASING_KARKUN_SEARCH } from './gql';

const DEFAULT_PAGE_SIZE = 20;

interface Props {
  /** Karkuns already added; their row shows a disabled button. */
  selectedIds?: string[];
  addingId?: string | null;
  selectedLabel?: string;
  addLabel?: string;
  /** The paged karkun query and the field it returns; defaults to the Permissions page search. */
  query?: TypedDocumentNode<any, any>;
  dataKey?: string;
  onAdd: (karkun: KarkunSelectionItem) => void;
}

// Searches the karkuns (with a user account) of Purchasing's city. Meant to
// sit inside a Drawer, which is created fresh each time it opens.
const KarkunPicker = ({
  selectedIds,
  addingId,
  selectedLabel = 'Added',
  addLabel,
  query = PURCHASING_KARKUN_SEARCH,
  dataKey = 'purchasingKarkunSearch',
  onAdd,
}: Props) => {
  const [filter, setFilter] = useState<KarkunSelectionFilter>({});
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const { data, loading, refetch } = useQuery(query, {
    variables: {
      name: filter.name || undefined,
      cnicNumber: filter.cnicNumber || undefined,
      phoneNumber: filter.phoneNumber || undefined,
      pageIndex: String(pageIndex),
      pageSize: String(pageSize),
    },
    fetchPolicy: 'network-only',
  });

  const result = data?.[dataKey];
  const karkuns: KarkunSelectionItem[] = ((result?.data ?? []) as KarkunSelectionItem[]).flatMap((karkun) =>
    karkun?._id ? [{ ...karkun, _id: karkun._id }] : []
  );

  const setPageParams = ({
    pageIndex: nextPageIndex,
    pageSize: nextPageSize,
    ...filterChanges
  }: KarkunSelectionPageParams) => {
    if (nextPageIndex != null) setPageIndex(Number(nextPageIndex));
    if (nextPageSize != null) setPageSize(Number(nextPageSize));
    if (Object.keys(filterChanges).length > 0) {
      setFilter((prev) => ({ ...prev, ...filterChanges }));
    }
  };

  return (
    <KarkunSelectionList
      karkuns={karkuns}
      totalResults={result?.totalResults ?? 0}
      loading={loading}
      pageIndex={pageIndex}
      pageSize={pageSize}
      filter={filter}
      selectedIds={selectedIds}
      selectedLabel={selectedLabel}
      addLabel={addLabel}
      addingId={addingId}
      setPageParams={setPageParams}
      refreshData={refetch}
      onAdd={onAdd}
    />
  );
};

export default KarkunPicker;
