import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { Button, Drawer, Input, Pagination, Space, Table } from 'antd';
import { SyncOutlined, UserAddOutlined } from '@ant-design/icons';

import type { WorkspaceCommitteeKarkunSearchQuery } from 'meteor/idreesia-common/types/client-operations';
import { PersonName } from '/imports/ui/modules/helpers/controls';
import { message } from '/imports/ui/antd-feedback';

import {
  WORKSPACE_ADD_COMMITTEE_MEMBER,
  WORKSPACE_COMMITTEE_KARKUN_SEARCH,
} from './gql';

type Karkun = NonNullable<
  NonNullable<
    NonNullable<
      WorkspaceCommitteeKarkunSearchQuery['workspaceCommitteeKarkunSearch']
    >['data']
  >[number]
>;

const DEFAULT_PAGE_SIZE = 20;

interface Props {
  open: boolean;
  committeeId: string;
  memberIds: string[];
  onClose(): void;
  onMemberAdded(): void;
}

const AddMemberDrawer = ({
  open,
  committeeId,
  memberIds,
  onClose,
  onMemberAdded,
}: Props) => {
  const [name, setName] = useState<string | undefined>(undefined);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [addingId, setAddingId] = useState<string | null>(null);

  const { data, loading, refetch } = useQuery(
    WORKSPACE_COMMITTEE_KARKUN_SEARCH,
    {
      variables: {
        committeeId,
        name,
        pageIndex: String(pageIndex),
        pageSize: String(pageSize),
      },
      skip: !open,
      fetchPolicy: 'network-only',
    }
  );
  const [addMember] = useMutation(WORKSPACE_ADD_COMMITTEE_MEMBER);

  const karkuns = (data?.workspaceCommitteeKarkunSearch?.data ?? []).filter(
    (karkun): karkun is Karkun => karkun != null && karkun._id != null
  );
  const totalResults = data?.workspaceCommitteeKarkunSearch?.totalResults ?? 0;

  const handleSearch = (value: string) => {
    setName(value.trim() || undefined);
    setPageIndex(0);
  };

  const handleAdd = (karkun: Karkun) => {
    setAddingId(karkun._id!);
    addMember({ variables: { committeeId, karkunId: karkun._id! } })
      .then(() => {
        message.success(`${karkun.name} added to the committee.`, 3);
        onMemberAdded();
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      })
      .finally(() => setAddingId(null));
  };

  const onPaginationChange = (page: number, size: number) => {
    setPageIndex(page - 1);
    setPageSize(size);
  };

  const columns = [
    {
      title: 'Name',
      key: 'name',
      render: (_text: unknown, record: Karkun) => (
        <PersonName
          person={{
            _id: record._id,
            name: record.name ?? '',
            imageId: record.imageId,
            imageThumbnailId: record.imageThumbnailId,
          }}
        />
      ),
    },
    {
      title: 'S/O',
      dataIndex: 'parentName',
      key: 'parentName',
    },
    {
      title: 'CNIC Number',
      dataIndex: 'cnicNumber',
      key: 'cnicNumber',
      width: 160,
    },
    {
      title: 'Contact Number',
      dataIndex: 'contactNumber1',
      key: 'contactNumber1',
      width: 150,
    },
    {
      key: 'action',
      width: 110,
      render: (_text: unknown, record: Karkun) => {
        if (memberIds.includes(record._id!)) {
          return <Button size="small" disabled>Member</Button>;
        }
        return (
          <Button
            size="small"
            type="primary"
            icon={<UserAddOutlined />}
            loading={addingId === record._id}
            onClick={() => handleAdd(record)}
          >
            Add
          </Button>
        );
      },
    },
  ];

  return (
    <Drawer
      title="Add Member"
      width={900}
      open={open}
      onClose={onClose}
      destroyOnHidden
    >
      <div className="list-container">
        <div className="list-table-header" style={{ marginBottom: 12 }}>
          <Space size={12}>
            <Input.Search
              allowClear
              placeholder="Search by name"
              onSearch={handleSearch}
              style={{ width: 320 }}
            />
          </Space>
          <div className="list-table-header-utilities">
            <Space size={8}>
              <Button
                icon={<SyncOutlined />}
                onClick={() => refetch()}
                title="Reload Data"
              />
            </Space>
          </div>
        </div>
        <Table
          className="list-table"
          rowKey="_id"
          dataSource={karkuns}
          columns={columns}
          loading={loading}
          bordered
          size="middle"
          tableLayout="fixed"
          pagination={false}
          footer={() => (
            <Pagination
              current={pageIndex + 1}
              pageSize={pageSize}
              showSizeChanger
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} of ${total} karkuns`
              }
              onChange={onPaginationChange}
              onShowSizeChange={onPaginationChange}
              total={totalResults}
            />
          )}
        />
      </div>
    </Drawer>
  );
};

export default AddMemberDrawer;
