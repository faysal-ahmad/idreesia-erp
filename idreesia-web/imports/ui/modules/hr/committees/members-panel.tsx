import React from 'react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { Popconfirm, Row, Table, Tooltip } from 'antd';
import { CrownFilled, CrownOutlined, UserDeleteOutlined } from '@ant-design/icons';
import { message } from '/imports/ui/antd-feedback';

import type {
  AddCommitteeCoordinatorMutation,
  AddCommitteeCoordinatorMutationVariables,
  RemoveCommitteeCoordinatorMutation,
  RemoveCommitteeCoordinatorMutationVariables,
  RemoveCommitteeMemberMutation,
  RemoveCommitteeMemberMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const REMOVE_COMMITTEE_MEMBER: TypedDocumentNode<
  RemoveCommitteeMemberMutation,
  RemoveCommitteeMemberMutationVariables
> = gql`
  mutation removeCommitteeMember($committeeId: String!, $karkunId: String!) {
    removeCommitteeMember(committeeId: $committeeId, karkunId: $karkunId) {
      _id
    }
  }
`;

const ADD_COMMITTEE_COORDINATOR: TypedDocumentNode<
  AddCommitteeCoordinatorMutation,
  AddCommitteeCoordinatorMutationVariables
> = gql`
  mutation addCommitteeCoordinator($committeeId: String!, $karkunId: String!) {
    addCommitteeCoordinator(committeeId: $committeeId, karkunId: $karkunId) {
      _id
    }
  }
`;

const REMOVE_COMMITTEE_COORDINATOR: TypedDocumentNode<
  RemoveCommitteeCoordinatorMutation,
  RemoveCommitteeCoordinatorMutationVariables
> = gql`
  mutation removeCommitteeCoordinator($committeeId: String!, $karkunId: String!) {
    removeCommitteeCoordinator(committeeId: $committeeId, karkunId: $karkunId) {
      _id
    }
  }
`;

export interface CommitteeMember {
  _id: string;
  name: string;
  cnicNumber?: string | null;
  contactNumber1?: string | null;
  contactNumber2?: string | null;
}

interface Props {
  committeeId: string;
  members: CommitteeMember[];
  coordinatorKarkunIds?: (string | null)[] | null;
}

const CommitteeMembersPanel = ({
  committeeId,
  members,
  coordinatorKarkunIds,
}: Props) => {
  const [removeCommitteeMember] = useMutation(REMOVE_COMMITTEE_MEMBER, {
    refetchQueries: ['listAllCommittees'],
  });
  const [addCommitteeCoordinator] = useMutation(ADD_COMMITTEE_COORDINATOR, {
    refetchQueries: ['listAllCommittees'],
  });
  const [removeCommitteeCoordinator] = useMutation(
    REMOVE_COMMITTEE_COORDINATOR,
    { refetchQueries: ['listAllCommittees'] }
  );

  const handleRemove = (karkunId: string) => {
    removeCommitteeMember({ variables: { committeeId, karkunId } }).catch(
      (error: Error) => {
        message.error(error.message, 5);
      }
    );
  };

  const handleToggleCoordinator = (
    karkunId: string,
    isCoordinator: boolean
  ) => {
    const mutate = isCoordinator
      ? removeCommitteeCoordinator
      : addCommitteeCoordinator;
    mutate({ variables: { committeeId, karkunId } }).catch((error: Error) => {
      message.error(error.message, 5);
    });
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'CNIC Number',
      dataIndex: 'cnicNumber',
      key: 'cnicNumber',
    },
    {
      title: 'Contact Number',
      key: 'contactNumber',
      render: (_text: unknown, record: CommitteeMember) => {
        const numbers: React.ReactNode[] = [];
        if (record.contactNumber1) {
          numbers.push(<Row key="1">{record.contactNumber1}</Row>);
        }
        if (record.contactNumber2) {
          numbers.push(<Row key="2">{record.contactNumber2}</Row>);
        }

        if (numbers.length === 0) return '';
        return <>{numbers}</>;
      },
    },
    {
      key: 'action',
      width: 80,
      render: (_text: unknown, record: CommitteeMember) => {
        const isCoordinator = (coordinatorKarkunIds ?? []).includes(
          record._id
        );
        return (
          <div className="list-actions-column">
            <Tooltip
              title={
                isCoordinator ? 'Remove as Coordinator' : 'Make Coordinator'
              }
            >
              {isCoordinator ? (
                <CrownFilled
                  className="list-actions-icon"
                  onClick={() => handleToggleCoordinator(record._id, true)}
                />
              ) : (
                <CrownOutlined
                  className="list-actions-icon"
                  onClick={() => handleToggleCoordinator(record._id, false)}
                />
              )}
            </Tooltip>
            <Popconfirm
              title="Remove this person from the committee?"
              onConfirm={() => handleRemove(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Remove">
                <UserDeleteOutlined className="list-actions-icon" />
              </Tooltip>
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  return (
    <Table
      rowKey="_id"
      dataSource={members}
      columns={columns}
      size="small"
      bordered
      pagination={false}
      locale={{ emptyText: 'No members added yet' }}
    />
  );
};

export default CommitteeMembersPanel;
