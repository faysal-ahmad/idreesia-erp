import React, { useState } from 'react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useMutation } from '@apollo/client/react';

import type {
  AddCommitteeMemberMutation,
  AddCommitteeMemberMutationVariables,
  CommitteeLocationKarkunsQuery,
  CommitteeLocationKarkunsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';
import {
  PICKER_PERSON_FIELDS,
  PersonPickerDrawer,
  type PersonSearchSource,
  type PickerPerson,
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
        ...PickerPersonFields
      }
    }
  }
  ${PICKER_PERSON_FIELDS}
`;

const committeeLocationKarkunSource: PersonSearchSource<CommitteeLocationKarkunsQuery> = {
  query: COMMITTEE_LOCATION_KARKUNS,
  select: data => data.pagedOrgLocationKarkuns,
  description:
    "Showing karkuns of the committee's location and of every location below it.",
};

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
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addCommitteeMember] = useMutation(ADD_COMMITTEE_MEMBER, {
    refetchQueries: ['committeeById', 'committeeMembers', 'locationCommittees'],
  });

  const handleAdd = (karkun: PickerPerson) => {
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
    <PersonPickerDrawer
      title={title}
      open={committeeId != null}
      onClose={onClose}
      source={{ ...committeeLocationKarkunSource, variables: { locationId } }}
      selectedIds={memberIds}
      addingId={addingId}
      onPick={handleAdd}
    />
  );
};

export default AddMemberDrawer;
