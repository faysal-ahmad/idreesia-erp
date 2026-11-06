import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  Button,
  Empty,
  Flex,
  Pagination,
  Popconfirm,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import {
  PlusCircleOutlined,
  SyncOutlined,
  UserDeleteOutlined,
} from '@ant-design/icons';

import type { WorkspaceCommitteeMembersQuery } from 'meteor/idreesia-common/types/client-operations';
import { PersonName } from '/imports/ui/modules/helpers/controls';
import { message } from '/imports/ui/antd-feedback';

import AddMemberDrawer from './add-member-drawer';
import {
  WORKSPACE_COMMITTEE_MEMBERS,
  WORKSPACE_REMOVE_COMMITTEE_MEMBER,
} from './gql';

type Member = NonNullable<
  NonNullable<
    NonNullable<WorkspaceCommitteeMembersQuery['workspaceCommitteeById']>['members']
  >[number]
>;

const DEFAULT_PAGE_SIZE = 20;

const List = () => {
  const { committeeId } = useParams<{ committeeId: string }>();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [showAddDrawer, setShowAddDrawer] = useState(false);

  const { data, loading, refetch } = useQuery(WORKSPACE_COMMITTEE_MEMBERS, {
    variables: { committeeId: committeeId! },
    skip: !committeeId,
    fetchPolicy: 'cache-and-network',
  });
  const [removeMember] = useMutation(WORKSPACE_REMOVE_COMMITTEE_MEMBER);

  if (loading && !data) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: 240 }}>
        <Spin />
      </Flex>
    );
  }

  const committee = data?.workspaceCommitteeById;
  if (!committee) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: 240 }}>
        <Empty description="You are not a member of this committee." />
      </Flex>
    );
  }

  const canManageMembers = !!committee.canManageMembers;
  const members = (committee.members ?? []).filter(
    (member): member is Member => member != null && member.karkunId != null
  );
  const memberIds = members.map((member) => member.karkunId!);

  const totalResults = members.length;
  const lastPageIndex = Math.max(0, Math.ceil(totalResults / pageSize) - 1);
  const safePageIndex = Math.min(pageIndex, lastPageIndex);
  const pageData = members.slice(
    safePageIndex * pageSize,
    (safePageIndex + 1) * pageSize
  );

  const handleRefresh = () => {
    refetch();
  };

  const handleRemove = (karkunId: string) => {
    removeMember({ variables: { committeeId: committeeId!, karkunId } })
      .then(() => refetch())
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const handleMemberAdded = () => {
    refetch();
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
              imageId: record.imageId,
              imageThumbnailId: record.imageThumbnailId,
            }}
          />
          {record.isCoordinator ? <Tag color="gold">Coordinator</Tag> : null}
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
    ...(canManageMembers
      ? [
          {
            key: 'action',
            width: 80,
            render: (_text: unknown, record: Member) => {
              if (record.isCoordinator) return null;
              return (
                <div className="list-actions-column">
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
                </div>
              );
            },
          },
        ]
      : []),
  ];

  return (
    <>
      <div className="list-container">
        <div className="list-table-header" style={{ marginBottom: 12 }}>
          <Space size={12}>
            {canManageMembers ? (
              <Button
                type="primary"
                icon={<PlusCircleOutlined />}
                onClick={() => setShowAddDrawer(true)}
              >
                Add Member
              </Button>
            ) : null}
          </Space>
          <div className="list-table-header-utilities">
            <Space size={8}>
              <Button
                icon={<SyncOutlined />}
                onClick={handleRefresh}
                title="Reload Data"
              />
            </Space>
          </div>
        </div>
        <Table
          className="list-table"
          rowKey="karkunId"
          dataSource={pageData}
          columns={columns}
          bordered
          size="middle"
          tableLayout="fixed"
          pagination={false}
          locale={{ emptyText: 'No members yet' }}
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

      {canManageMembers ? (
        <AddMemberDrawer
          open={showAddDrawer}
          committeeId={committeeId!}
          memberIds={memberIds}
          onClose={() => setShowAddDrawer(false)}
          onMemberAdded={handleMemberAdded}
        />
      ) : null}
    </>
  );
};

export default List;
