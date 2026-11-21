import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';

import {
  KarkunSelectionList,
  type KarkunSelectionFilter,
  type KarkunSelectionItem,
  type KarkunSelectionPageParams,
} from '/imports/ui/modules/helpers/controls';

import { WORKSPACE_MEHFIL_PERMISSIONS_KARKUN_SEARCH } from './gql';

const DEFAULT_PAGE_SIZE = 20;

interface Props {
  locationId: string;
  /** Karkuns already holding the permission; their row shows a disabled button. */
  selectedIds?: string[];
  addingId?: string | null;
  onAdd: (karkun: KarkunSelectionItem) => void;
}

// Searches the karkuns a permission can be given to. Meant to sit inside a
// Drawer, which is created fresh each time it opens.
const KarkunPicker = ({ locationId, selectedIds, addingId, onAdd }: Props) => {
  const [filter, setFilter] = useState<KarkunSelectionFilter>({});
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const { data, loading, refetch } = useQuery(
    WORKSPACE_MEHFIL_PERMISSIONS_KARKUN_SEARCH,
    {
      variables: {
        locationId,
        name: filter.name || undefined,
        cnicNumber: filter.cnicNumber || undefined,
        phoneNumber: filter.phoneNumber || undefined,
        pageIndex: String(pageIndex),
        pageSize: String(pageSize),
      },
      fetchPolicy: 'network-only',
    }
  );

  const result = data?.workspaceMehfilPermissionsKarkunSearch;
  const karkuns: KarkunSelectionItem[] = (result?.data ?? []).flatMap(karkun =>
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
      setFilter(prev => ({ ...prev, ...filterChanges }));
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
      selectedLabel="Added"
      addingId={addingId}
      setPageParams={setPageParams}
      refreshData={refetch}
      onAdd={onAdd}
    />
  );
};

export default KarkunPicker;
