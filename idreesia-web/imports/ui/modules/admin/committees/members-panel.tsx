import React, { useState } from 'react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { Checkbox, Popconfirm, Popover, Radio, Row, Table, Tag, Tooltip } from 'antd';
import {
  CheckOutlined,
  UserDeleteOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons';
import { message } from '/imports/ui/antd-feedback';
import { PersonName } from '/imports/ui/modules/helpers/controls';

import type {
  RemoveCommitteeMemberMutation,
  RemoveCommitteeMemberMutationVariables,
  SetCommitteeMemberRoleMutation,
  SetCommitteeMemberRoleMutationVariables,
  SetCommitteeMemberDiscussionAccessMutation,
  SetCommitteeMemberDiscussionAccessMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';
import {
  CommitteeMemberRoles,
  type CommitteeMemberRole,
} from 'meteor/idreesia-common/constants/organization';

import { MEMBER_ROLE_COLORS, MEMBER_ROLE_LABELS } from './member-roles';

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

const SET_COMMITTEE_MEMBER_ROLE: TypedDocumentNode<
  SetCommitteeMemberRoleMutation,
  SetCommitteeMemberRoleMutationVariables
> = gql`
  mutation setCommitteeMemberRole(
    $committeeId: String!
    $karkunId: String!
    $role: String!
  ) {
    setCommitteeMemberRole(
      committeeId: $committeeId
      karkunId: $karkunId
      role: $role
    ) {
      _id
    }
  }
`;

const SET_COMMITTEE_MEMBER_DISCUSSION_ACCESS: TypedDocumentNode<
  SetCommitteeMemberDiscussionAccessMutation,
  SetCommitteeMemberDiscussionAccessMutationVariables
> = gql`
  mutation setCommitteeMemberDiscussionAccess(
    $committeeId: String!
    $karkunId: String!
    $hasAccess: Boolean!
  ) {
    setCommitteeMemberDiscussionAccess(
      committeeId: $committeeId
      karkunId: $karkunId
      hasAccess: $hasAccess
    )
  }
`;

export interface CommitteeMember {
  _id: string;
  name: string;
  imageUrl?: string | null;
  imageThumbnailUrl?: string | null;
  contactNumber1?: string | null;
  contactNumber2?: string | null;
  role: CommitteeMemberRole;
  hasLoginAccount: boolean;
  hasChatAccount: boolean;
  /** Null when Discussions is not enabled (or chat is unreachable). */
  hasDiscussionAccess: boolean | null;
}

// Only these two can be switched between; guests and observers are added or
// removed, not changed.
const SWITCHABLE_ROLES: CommitteeMemberRole[] = [
  CommitteeMemberRoles.MEMBER,
  CommitteeMemberRoles.COORDINATOR,
];

const renderCheck = (value: boolean) => (value ? <CheckOutlined /> : null);

interface Props {
  committeeId: string;
  members: CommitteeMember[];
  loading?: boolean;
  /**
   * Shows each member's role pill and the role switcher (member or
   * coordinator). Off for the guests and observers tabs.
   */
  allowRoleChange?: boolean;
  emptyText?: string;
}

const CommitteeMembersPanel = ({
  committeeId,
  members,
  loading = false,
  allowRoleChange = false,
  emptyText = 'No members added yet',
}: Props) => {
  const [removeCommitteeMember] = useMutation(REMOVE_COMMITTEE_MEMBER, {
    refetchQueries: ['committeeById', 'committeeMembers', 'listAllCommittees'],
  });
  const [setMemberRole] = useMutation(SET_COMMITTEE_MEMBER_ROLE, {
    refetchQueries: ['committeeById', 'committeeMembers', 'listAllCommittees'],
  });
  const [roleMemberId, setRoleMemberId] = useState<string | null>(null);
  const [setDiscussionAccess] = useMutation(
    SET_COMMITTEE_MEMBER_DISCUSSION_ACCESS,
    { refetchQueries: ['committeeById', 'committeeMembers', 'listAllCommittees'], awaitRefetchQueries: true }
  );
  const [savingAccessId, setSavingAccessId] = useState<string | null>(null);

  const handleRemove = (karkunId: string) => {
    removeCommitteeMember({ variables: { committeeId, karkunId } }).catch(
      (error: Error) => {
        message.error(error.message, 5);
      }
    );
  };

  const handleRoleChange = (karkunId: string, role: CommitteeMemberRole) => {
    setRoleMemberId(null);
    setMemberRole({ variables: { committeeId, karkunId, role } }).catch(
      (error: Error) => {
        message.error(error.message, 5);
      }
    );
  };

  const handleDiscussionAccessChange = (
    karkunId: string,
    hasAccess: boolean
  ) => {
    setSavingAccessId(karkunId);
    setDiscussionAccess({ variables: { committeeId, karkunId, hasAccess } })
      .catch((error: Error) => {
        message.error(error.message, 5);
      })
      .finally(() => setSavingAccessId(null));
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (_text: unknown, record: CommitteeMember) => (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <PersonName person={record} />
          {allowRoleChange ? (
            <Tag color={MEMBER_ROLE_COLORS[record.role]} style={{ margin: 0 }}>
              {MEMBER_ROLE_LABELS[record.role]}
            </Tag>
          ) : null}
        </div>
      ),
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
      title: 'Has Login Account',
      key: 'hasLoginAccount',
      width: 150,
      align: 'center' as const,
      render: (_text: unknown, record: CommitteeMember) =>
        renderCheck(record.hasLoginAccount),
    },
    {
      title: 'Has Chat Account',
      key: 'hasChatAccount',
      width: 150,
      align: 'center' as const,
      render: (_text: unknown, record: CommitteeMember) =>
        renderCheck(record.hasChatAccount),
    },
    {
      title: 'Has Discussion Access',
      key: 'hasDiscussionAccess',
      width: 180,
      align: 'center' as const,
      // Editable for members with a chat account, while Discussions is
      // enabled.
      render: (_text: unknown, record: CommitteeMember) => (
        <Checkbox
          checked={!!record.hasDiscussionAccess}
          disabled={
            record.hasDiscussionAccess === null ||
            !record.hasChatAccount ||
            savingAccessId != null
          }
          onChange={event =>
            handleDiscussionAccessChange(record._id, event.target.checked)
          }
        />
      ),
    },
    {
      key: 'action',
      width: 80,
      render: (_text: unknown, record: CommitteeMember) => {
        return (
          <div className="list-actions-column">
            {allowRoleChange ? (
            <Popover
              title="Change Role"
              trigger="click"
              placement="left"
              open={roleMemberId === record._id}
              onOpenChange={open => setRoleMemberId(open ? record._id : null)}
              content={
                <Radio.Group
                  value={record.role}
                  onChange={event =>
                    handleRoleChange(record._id, event.target.value)
                  }
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {SWITCHABLE_ROLES.map(role => (
                      <Radio key={role} value={role}>
                        <Tag color={MEMBER_ROLE_COLORS[role]}>
                          {MEMBER_ROLE_LABELS[role]}
                        </Tag>
                      </Radio>
                    ))}
                  </div>
                </Radio.Group>
              }
            >
              <Tooltip title="Change Role">
                <UserSwitchOutlined className="list-actions-icon" />
              </Tooltip>
            </Popover>
            ) : null}
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
      loading={loading}
      columns={columns}
      size="small"
      bordered
      pagination={false}
      locale={{ emptyText }}
    />
  );
};

export default CommitteeMembersPanel;
