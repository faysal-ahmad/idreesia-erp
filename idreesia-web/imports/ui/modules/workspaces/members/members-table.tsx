import React, { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import {
  Alert,
  Checkbox,
  Flex,
  Pagination,
  Popconfirm,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import {
  CrownFilled,
  CrownOutlined,
  UserDeleteOutlined,
} from '@ant-design/icons';

import type { WorkspaceCommitteeMembersQuery } from 'meteor/idreesia-common/types/client-operations';
import { PersonName } from '/imports/ui/modules/helpers/controls';
import { message } from '/imports/ui/antd-feedback';

import {
  WORKSPACE_REMOVE_COMMITTEE_MEMBER,
  WORKSPACE_SET_COMMITTEE_MEMBER_COORDINATOR,
  WORKSPACE_SET_COMMITTEE_MEMBER_DISCUSSION_ACCESS,
} from './gql';

export type Member = NonNullable<
  NonNullable<
    NonNullable<WorkspaceCommitteeMembersQuery['workspaceCommitteeById']>['members']
  >[number]
>;

const DEFAULT_PAGE_SIZE = 20;

interface Props {
  committeeId: string;
  /** The people shown on this tab. */
  members: Member[];
  canManageMembers: boolean;
  discussionsEnabled: boolean;
  /** Members tab only: coordinator pill and the member/coordinator toggle. */
  allowRoleChange?: boolean;
  /** Whether people can be removed from this tab (not for observers). */
  allowRemove: boolean;
  emptyText: string;
  /** An explanation shown above the table. */
  note?: string;
  refetch(): void;
}

const MembersTable = ({
  committeeId,
  members,
  canManageMembers,
  discussionsEnabled,
  allowRoleChange = false,
  allowRemove,
  emptyText,
  note,
  refetch,
}: Props) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [removeMember] = useMutation(WORKSPACE_REMOVE_COMMITTEE_MEMBER);
  const [setDiscussionAccess] = useMutation(
    WORKSPACE_SET_COMMITTEE_MEMBER_DISCUSSION_ACCESS
  );
  const [setCoordinator] = useMutation(WORKSPACE_SET_COMMITTEE_MEMBER_COORDINATOR);
  const [savingAccessId, setSavingAccessId] = useState<string | null>(null);

  const showActions = canManageMembers && (allowRoleChange || allowRemove);

  const totalResults = members.length;
  const lastPageIndex = Math.max(0, Math.ceil(totalResults / pageSize) - 1);
  const safePageIndex = Math.min(pageIndex, lastPageIndex);
  const pageData = members.slice(
    safePageIndex * pageSize,
    (safePageIndex + 1) * pageSize
  );

  const handleRemove = (karkunId: string) => {
    removeMember({ variables: { committeeId, karkunId } })
      .then(() => refetch())
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const handleDiscussionAccessChange = (karkunId: string, hasAccess: boolean) => {
    setSavingAccessId(karkunId);
    setDiscussionAccess({
      variables: { committeeId, karkunId, hasAccess },
    })
      .then(() => refetch())
      .catch((error: Error) => {
        message.error(error.message, 5);
      })
      .finally(() => setSavingAccessId(null));
  };

  const handleToggleCoordinator = (karkunId: string, isCoordinator: boolean) => {
    setCoordinator({
      variables: { committeeId, karkunId, isCoordinator },
    })
      .then(() => refetch())
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const onPaginationChange = (page: number, size: number) => {
    setPageIndex(page - 1);
    setPageSize(size);
  };

  const columns = [
    {
      title: 'Name',
      key: 'name',
      render: (_text: unknown, record: Member) => (
        <Flex justify="space-between" align="center" gap={8}>
          <PersonName
            person={{
              _id: record.karkunId,
              name: record.name ?? '',
              imageUrl: record.imageUrl,
              imageThumbnailUrl: record.imageThumbnailUrl,
            }}
          />
          {allowRoleChange && record.isCoordinator ? (
            <Tag color="gold">Coordinator</Tag>
          ) : null}
        </Flex>
      ),
    },
    {
      title: 'Contact Number',
      key: 'contactNumber',
      width: 220,
      render: (_text: unknown, record: Member) => (
        <Flex vertical>
          {record.contactNumber1 ? <span>{record.contactNumber1}</span> : null}
          {record.contactNumber2 ? <span>{record.contactNumber2}</span> : null}
        </Flex>
      ),
    },
    {
      title: 'Has Discussion Access',
      key: 'hasDiscussionAccess',
      width: 180,
      align: 'center' as const,
      // Editable by coordinators, for members with a chat account, while
      // Discussions is enabled.
      render: (_text: unknown, record: Member) => (
        <Checkbox
          checked={!!record.hasDiscussionAccess}
          disabled={
            !canManageMembers ||
            !discussionsEnabled ||
            !record.hasChatAccount ||
            savingAccessId != null
          }
          onChange={event =>
            handleDiscussionAccessChange(record.karkunId!, event.target.checked)
          }
        />
      ),
    },
    ...(showActions
      ? [
          {
            key: 'action',
            width: 100,
            render: (_text: unknown, record: Member) => (
              <div className="list-actions-column">
                {allowRoleChange ? (
                <Tooltip
                  title={
                    record.isCoordinator
                      ? 'Remove as Coordinator'
                      : 'Make Coordinator'
                  }
                >
                  {record.isCoordinator ? (
                    <CrownFilled
                      className="list-actions-icon"
                      onClick={() =>
                        handleToggleCoordinator(record.karkunId!, false)
                      }
                    />
                  ) : (
                    <CrownOutlined
                      className="list-actions-icon"
                      onClick={() =>
                        handleToggleCoordinator(record.karkunId!, true)
                      }
                    />
                  )}
                </Tooltip>
                ) : null}
                {/* Coordinators are removed from the committee only after
                    they stop being coordinators. */}
                {record.isCoordinator || !allowRemove ? null : (
                  <Popconfirm
                    title="Remove this person from the committee?"
                    onConfirm={() => handleRemove(record.karkunId!)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Tooltip title="Remove">
                      <UserDeleteOutlined className="list-actions-icon" />
                    </Tooltip>
                  </Popconfirm>
                )}
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <>
      <div className="list-container">
        {note ? (
          <Alert
            type="info"
            showIcon
            message={note}
            style={{ marginBottom: 12 }}
          />
        ) : null}
        <Table
          className="list-table"
          rowKey="karkunId"
          dataSource={pageData}
          columns={columns}
          bordered
          size="middle"
          tableLayout="fixed"
          pagination={false}
          locale={{ emptyText }}
          footer={() => (
            <Pagination
              current={safePageIndex + 1}
              pageSize={pageSize}
              showSizeChanger
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} of ${total} members`
              }
              onChange={onPaginationChange}
              onShowSizeChange={onPaginationChange}
              total={totalResults}
            />
          )}
        />
      </div>

    </>
  );
};

export default MembersTable;
