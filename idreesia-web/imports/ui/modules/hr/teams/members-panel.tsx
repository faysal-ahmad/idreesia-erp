import React from 'react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { Popconfirm, Row, Table, Tooltip } from 'antd';
import { CrownFilled, CrownOutlined, UserDeleteOutlined } from '@ant-design/icons';
import { message } from '/imports/ui/antd-feedback';

import type {
  AddTeamCoordinatorMutation,
  AddTeamCoordinatorMutationVariables,
  RemoveTeamCoordinatorMutation,
  RemoveTeamCoordinatorMutationVariables,
  RemoveTeamMemberMutation,
  RemoveTeamMemberMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const REMOVE_TEAM_MEMBER: TypedDocumentNode<
  RemoveTeamMemberMutation,
  RemoveTeamMemberMutationVariables
> = gql`
  mutation removeTeamMember($teamId: String!, $karkunId: String!) {
    removeTeamMember(teamId: $teamId, karkunId: $karkunId) {
      _id
    }
  }
`;

const ADD_TEAM_COORDINATOR: TypedDocumentNode<
  AddTeamCoordinatorMutation,
  AddTeamCoordinatorMutationVariables
> = gql`
  mutation addTeamCoordinator($teamId: String!, $karkunId: String!) {
    addTeamCoordinator(teamId: $teamId, karkunId: $karkunId) {
      _id
    }
  }
`;

const REMOVE_TEAM_COORDINATOR: TypedDocumentNode<
  RemoveTeamCoordinatorMutation,
  RemoveTeamCoordinatorMutationVariables
> = gql`
  mutation removeTeamCoordinator($teamId: String!, $karkunId: String!) {
    removeTeamCoordinator(teamId: $teamId, karkunId: $karkunId) {
      _id
    }
  }
`;

export interface TeamMember {
  _id: string;
  name: string;
  cnicNumber?: string | null;
  contactNumber1?: string | null;
  contactNumber2?: string | null;
}

interface Props {
  teamId: string;
  members: TeamMember[];
  coordinatorKarkunIds?: (string | null)[] | null;
}

const TeamMembersPanel = ({ teamId, members, coordinatorKarkunIds }: Props) => {
  const [removeTeamMember] = useMutation(REMOVE_TEAM_MEMBER, {
    refetchQueries: ['listAllTeams'],
  });
  const [addTeamCoordinator] = useMutation(ADD_TEAM_COORDINATOR, {
    refetchQueries: ['listAllTeams'],
  });
  const [removeTeamCoordinator] = useMutation(REMOVE_TEAM_COORDINATOR, {
    refetchQueries: ['listAllTeams'],
  });

  const handleRemove = (karkunId: string) => {
    removeTeamMember({ variables: { teamId, karkunId } }).catch(
      (error: Error) => {
        message.error(error.message, 5);
      }
    );
  };

  const handleToggleCoordinator = (
    karkunId: string,
    isCoordinator: boolean
  ) => {
    const mutate = isCoordinator ? removeTeamCoordinator : addTeamCoordinator;
    mutate({ variables: { teamId, karkunId } }).catch((error: Error) => {
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
      render: (_text: unknown, record: TeamMember) => {
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
      render: (_text: unknown, record: TeamMember) => {
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
              title="Remove this person from the team?"
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

export default TeamMembersPanel;
