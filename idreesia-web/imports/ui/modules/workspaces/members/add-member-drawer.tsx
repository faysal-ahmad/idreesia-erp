import React, { useState } from 'react';
import { useMutation } from '@apollo/client/react';

import {
  PersonPickerDrawer,
  type PickerPerson,
} from '/imports/ui/modules/helpers/controls';
import { message } from '/imports/ui/antd-feedback';

import { WORKSPACE_ADD_COMMITTEE_MEMBER, committeeKarkunSource } from './gql';

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
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addMember] = useMutation(WORKSPACE_ADD_COMMITTEE_MEMBER);

  const handleAdd = (karkun: PickerPerson) => {
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
    <PersonPickerDrawer
      title={title}
      open={open}
      onClose={onClose}
      source={{ ...committeeKarkunSource, variables: { committeeId } }}
      selectedIds={memberIds}
      addingId={addingId}
      onPick={handleAdd}
    />
  );
};

export default AddMemberDrawer;
