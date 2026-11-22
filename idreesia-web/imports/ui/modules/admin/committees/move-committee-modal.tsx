import React, { useMemo, useState } from 'react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { Form, Input, Modal, Select } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import type {
  MoveCommitteeMutation,
  MoveCommitteeMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

import { ALL_ORG_LOCATIONS } from '../org-locations/gql';
import { toLocationRecords } from '../org-locations/helpers';
import { getLocationPath } from '../org-locations/org-location-types';

const MOVE_COMMITTEE: TypedDocumentNode<
  MoveCommitteeMutation,
  MoveCommitteeMutationVariables
> = gql`
  mutation moveCommittee($committeeId: String!, $locationId: String!) {
    moveCommittee(committeeId: $committeeId, locationId: $locationId) {
      _id
      locationId
    }
  }
`;

interface Props {
  /** The committee being moved; the modal is open while this is set. */
  committee: { _id: string; name: string; locationId: string } | null;
  onClose(): void;
  /** Called with the new location id once the move has succeeded. */
  onMoved(locationId: string): void;
}

const MoveCommitteeModal = ({ committee, onClose, onMoved }: Props) => {
  const [targetId, setTargetId] = useState<string | undefined>();
  const open = committee != null;

  const { data, loading } = useQuery(ALL_ORG_LOCATIONS, { skip: !open });
  const [moveCommittee, { loading: moving }] = useMutation(MOVE_COMMITTEE, {
    refetchQueries: ['locationCommittees', 'allOrgLocations', 'committeeById', 'orgLocationById'],
  });

  const { currentPath, options } = useMemo(() => {
    const records = toLocationRecords(data?.allOrgLocations);
    const byId = new Map(records.map(record => [record._id, record]));
    const current = committee ? byId.get(committee.locationId) : undefined;
    return {
      currentPath: current ? getLocationPath(current, byId) : '',
      options: records
        .filter(record => record._id !== committee?.locationId)
        .map(record => ({
          value: record._id,
          label: getLocationPath(record, byId),
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    };
  }, [data, committee]);

  const handleClose = () => {
    setTargetId(undefined);
    onClose();
  };

  const handleMove = () => {
    if (!committee || !targetId) return;
    moveCommittee({
      variables: { committeeId: committee._id, locationId: targetId },
    })
      .then(() => {
        message.success('Committee moved', 2);
        setTargetId(undefined);
        onMoved(targetId);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  return (
    <Modal
      title={`Move "${committee?.name ?? ''}"`}
      open={open}
      okText="Move"
      okButtonProps={{ disabled: !targetId }}
      confirmLoading={moving}
      onOk={handleMove}
      onCancel={handleClose}
      destroyOnHidden
    >
      <Form layout="vertical" style={{ width: '100%' }}>
        <Form.Item label="Current location">
          <Input value={currentPath} readOnly disabled />
        </Form.Item>
        <Form.Item label="Move to" required>
          <Select
            showSearch
            style={{ width: '100%' }}
            optionFilterProp="label"
            placeholder="Select a location"
            loading={loading}
            options={options}
            value={targetId}
            onChange={setTargetId}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MoveCommitteeModal;
