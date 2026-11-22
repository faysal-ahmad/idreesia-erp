import React, { useState } from 'react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { Drawer } from 'antd';

import type {
  AddCommitteeMemberMutation,
  AddCommitteeMemberMutationVariables,
  CommitteeLocationKarkunsQuery,
  CommitteeLocationKarkunsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';
import {
  KarkunSelectionList,
  type KarkunSelectionFilter,
  type KarkunSelectionItem,
  type KarkunSelectionPageParams,
} from '/imports/ui/modules/helpers/controls';
import { message } from '/imports/ui/antd-feedback';

// The karkuns of the committee's location and every location below it.
const COMMITTEE_LOCATION_KARKUNS: TypedDocumentNode<
  CommitteeLocationKarkunsQuery,
  CommitteeLocationKarkunsQueryVariables
> = gql`
  query committeeLocationKarkuns(
    $locationId: String!
    $name: String
    $cnicNumber: String
    $phoneNumber: String
    $pageIndex: String
    $pageSize: String
  ) {
    pagedOrgLocationKarkuns(
      locationId: $locationId
      includeChildLocations: true
      name: $name
      cnicNumber: $cnicNumber
      phoneNumber: $phoneNumber
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      totalResults
      data {
        _id
        name
        parentName
        cnicNumber
        contactNumber1
        imageUrl
        imageThumbnailUrl
      }
    }
  }
`;

const ADD_COMMITTEE_MEMBER: TypedDocumentNode<
  AddCommitteeMemberMutation,
  AddCommitteeMemberMutationVariables
> = gql`
  mutation addCommitteeMember(
    $committeeId: String!
    $karkunId: String!
    $role: String
  ) {
    addCommitteeMember(
      committeeId: $committeeId
      karkunId: $karkunId
      role: $role
    ) {
      _id
    }
  }
`;

const DEFAULT_PAGE_SIZE = 20;

interface Props {
  committeeId: string | null;
  /** The committee's location: its karkuns, and those below it, are listed. */
  locationId: string;
  memberIds: string[];
  /** The role the added people get; defaults to member. */
  role?: string;
  /** The drawer's title; defaults to "Add Member". */
  title?: string;
  onClose(): void;
}

const AddMemberDrawer = ({
  committeeId,
  locationId,
  memberIds,
  role,
  title = 'Add Member',
  onClose,
}: Props) => {
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

  const { data, loading, refetch } = useQuery(COMMITTEE_LOCATION_KARKUNS, {
    variables: {
      locationId,
      name: filter.name || undefined,
      cnicNumber: filter.cnicNumber || undefined,
      phoneNumber: filter.phoneNumber || undefined,
      pageIndex: String(pageIndex),
      pageSize: String(pageSize),
    },
    skip: !open,
    fetchPolicy: 'network-only',
  });
  const [addCommitteeMember] = useMutation(ADD_COMMITTEE_MEMBER, {
    refetchQueries: ['committeeById', 'committeeMembers', 'locationCommittees'],
  });

  const karkuns: KarkunSelectionItem[] = (
    data?.pagedOrgLocationKarkuns?.data ?? []
  ).flatMap(person =>
    person?._id
      ? [
          {
            _id: person._id,
            name: person.name,
            parentName: person.parentName,
            cnicNumber: person.cnicNumber,
            contactNumber1: person.contactNumber1,
            imageUrl: person.imageUrl,
            imageThumbnailUrl: person.imageThumbnailUrl,
          },
        ]
      : []
  );
  const totalResults = data?.pagedOrgLocationKarkuns?.totalResults ?? 0;

  const handleClose = () => {
    setFilter({});
    setPageIndex(0);
    onClose();
  };

  const handleAdd = (karkun: KarkunSelectionItem) => {
    if (!committeeId) return;
    setAddingId(karkun._id);
    addCommitteeMember({
      variables: { committeeId, karkunId: karkun._id, role },
    })
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
      title={title}
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
