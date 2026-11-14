import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { Drawer } from 'antd';

import {
  KarkunSelectionList,
  type KarkunSelectionFilter,
  type KarkunSelectionItem,
  type KarkunSelectionPageParams,
} from '/imports/ui/modules/helpers/controls';
import { message } from '/imports/ui/antd-feedback';

import {
  WORKSPACE_ADD_COMMITTEE_MEMBER,
  WORKSPACE_COMMITTEE_KARKUN_SEARCH,
} from './gql';

const DEFAULT_PAGE_SIZE = 20;

interface Props {
  open: boolean;
  committeeId: string;
  memberIds: string[];
  /** The role the added people get (member or guest); defaults to member. */
  role?: string;
  /** The drawer's title; defaults to "Add Member". */
  title?: string;
  onClose(): void;
  onMemberAdded(): void;
}

const AddMemberDrawer = ({
  open,
  committeeId,
  memberIds,
  role,
  title = 'Add Member',
  onClose,
  onMemberAdded,
}: Props) => {
  const [filter, setFilter] = useState<KarkunSelectionFilter>({});
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

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
  const [addingId, setAddingId] = useState<string | null>(null);

  const { data, loading, refetch } = useQuery(
    WORKSPACE_COMMITTEE_KARKUN_SEARCH,
    {
      variables: {
        committeeId,
        name: filter.name || undefined,
        cnicNumber: filter.cnicNumber || undefined,
        phoneNumber: filter.phoneNumber || undefined,
        pageIndex: String(pageIndex),
        pageSize: String(pageSize),
      },
      skip: !open,
      fetchPolicy: 'network-only',
    }
  );
  const [addMember] = useMutation(WORKSPACE_ADD_COMMITTEE_MEMBER);

  const karkuns: KarkunSelectionItem[] = (
    data?.workspaceCommitteeKarkunSearch?.data ?? []
  ).flatMap(karkun =>
    karkun?._id ? [{ ...karkun, _id: karkun._id }] : []
  );
  const totalResults = data?.workspaceCommitteeKarkunSearch?.totalResults ?? 0;

  const handleAdd = (karkun: KarkunSelectionItem) => {
    setAddingId(karkun._id);
    addMember({ variables: { committeeId, karkunId: karkun._id, role } })
      .then(() => {
        message.success(`${karkun.name} added to the committee.`, 3);
        onMemberAdded();
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      })
      .finally(() => setAddingId(null));
  };

  return (
    <Drawer
      title={title}
      width={900}
      open={open}
      onClose={onClose}
      destroyOnHidden
    >
      <KarkunSelectionList
        karkuns={karkuns}
        totalResults={totalResults}
        loading={loading}
        pageIndex={pageIndex}
        pageSize={pageSize}
        filter={filter}
        selectedIds={memberIds}
        addingId={addingId}
        setPageParams={setPageParams}
        refreshData={refetch}
        onAdd={handleAdd}
      />
    </Drawer>
  );
};

export default AddMemberDrawer;
