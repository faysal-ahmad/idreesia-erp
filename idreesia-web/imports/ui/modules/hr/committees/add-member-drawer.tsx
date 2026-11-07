import React, { useState } from 'react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { Drawer } from 'antd';

import type {
  AddCommitteeMemberMutation,
  AddCommitteeMemberMutationVariables,
  HrCommitteeKarkunSearchQuery,
  HrCommitteeKarkunSearchQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';
import {
  KarkunSelectionList,
  type KarkunSelectionFilter,
  type KarkunSelectionItem,
  type KarkunSelectionPageParams,
} from '/imports/ui/modules/helpers/controls';
import { message } from '/imports/ui/antd-feedback';

const HR_COMMITTEE_KARKUN_SEARCH: TypedDocumentNode<
  HrCommitteeKarkunSearchQuery,
  HrCommitteeKarkunSearchQueryVariables
> = gql`
  query hrCommitteeKarkunSearch($filter: KarkunFilter) {
    pagedHrKarkuns(filter: $filter) {
      totalResults
      data {
        _id
        sharedData {
          name
          parentName
          cnicNumber
          contactNumber1
          imageId
          imageThumbnailId
        }
      }
    }
  }
`;

const ADD_COMMITTEE_MEMBER: TypedDocumentNode<
  AddCommitteeMemberMutation,
  AddCommitteeMemberMutationVariables
> = gql`
  mutation addCommitteeMember($committeeId: String!, $karkunId: String!) {
    addCommitteeMember(committeeId: $committeeId, karkunId: $karkunId) {
      _id
    }
  }
`;

const DEFAULT_PAGE_SIZE = 20;

interface Props {
  committeeId: string | null;
  memberIds: string[];
  onClose(): void;
}

const AddMemberDrawer = ({ committeeId, memberIds, onClose }: Props) => {
  const open = committeeId != null;
  const [filter, setFilter] = useState<KarkunSelectionFilter>({});
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [addingId, setAddingId] = useState<string | null>(null);

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

  const { data, loading, refetch } = useQuery(HR_COMMITTEE_KARKUN_SEARCH, {
    variables: {
      filter: {
        name: filter.name || undefined,
        cnicNumber: filter.cnicNumber || undefined,
        phoneNumber: filter.phoneNumber || undefined,
        // Only karkuns can be committee members (enforced server-side).
        isKarkun: true,
        pageIndex: String(pageIndex),
        pageSize: String(pageSize),
      },
    },
    skip: !open,
    fetchPolicy: 'network-only',
  });
  const [addCommitteeMember] = useMutation(ADD_COMMITTEE_MEMBER, {
    refetchQueries: ['listAllCommittees'],
  });

  const karkuns: KarkunSelectionItem[] = (
    data?.pagedHrKarkuns?.data ?? []
  ).flatMap(person =>
    person?._id
      ? [
          {
            _id: person._id,
            name: person.sharedData?.name,
            parentName: person.sharedData?.parentName,
            cnicNumber: person.sharedData?.cnicNumber,
            contactNumber1: person.sharedData?.contactNumber1,
            imageId: person.sharedData?.imageId,
            imageThumbnailId: person.sharedData?.imageThumbnailId,
          },
        ]
      : []
  );
  const totalResults = data?.pagedHrKarkuns?.totalResults ?? 0;

  const handleClose = () => {
    setFilter({});
    setPageIndex(0);
    onClose();
  };

  const handleAdd = (karkun: KarkunSelectionItem) => {
    if (!committeeId) return;
    setAddingId(karkun._id);
    addCommitteeMember({ variables: { committeeId, karkunId: karkun._id } })
      .then(() => {
        message.success(`${karkun.name} added to the committee.`, 3);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      })
      .finally(() => setAddingId(null));
  };

  return (
    <Drawer
      title="Add Member"
      width={900}
      open={open}
      onClose={handleClose}
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
