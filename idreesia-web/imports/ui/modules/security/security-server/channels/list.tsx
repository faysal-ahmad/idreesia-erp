import React, { useState } from 'react';
import { type RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { Button, Checkbox, Pagination, Space, Spin, Table, Tag } from 'antd';
import { SyncOutlined } from '@ant-design/icons';

import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import type { AllSecurityServerChannelsQuery } from 'meteor/idreesia-common/types/client-operations';
import { message } from '/imports/ui/antd-feedback';

import paths from '../../submodule-paths';
import { ALL_SECURITY_SERVER_CHANNELS } from '../gql';
import useListScrollY from '../common/use-list-scroll-y';
import { formatScore } from '../common/format';

type ChannelRow = NonNullable<
  NonNullable<AllSecurityServerChannelsQuery['allSecurityServerChannels']>[number]
>;

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (text: string, record: ChannelRow) => (
      <>
        <Link to={`${paths.securityServerAlertsPath}?channelId=${record._id}`}>
          {text}
        </Link>
        {record.deletedAt ? (
          <Tag className="security-server-inline-tag" color="red">
            Deleted
          </Tag>
        ) : null}
      </>
    ),
  },
  {
    title: 'Enabled',
    dataIndex: 'enabled',
    key: 'enabled',
    width: 110,
    render: (enabled: boolean | null) =>
      enabled ? <Tag color="green">Enabled</Tag> : <Tag>Disabled</Tag>,
  },
  {
    title: 'Similarity Threshold',
    dataIndex: 'similarityThreshold',
    key: 'similarityThreshold',
    width: 180,
    render: (threshold: number | null) =>
      threshold == null ? 'Server default' : formatScore(threshold),
  },
  {
    title: 'Recognition FPS',
    dataIndex: 'recognitionFps',
    key: 'recognitionFps',
    width: 150,
  },
  {
    title: 'Alerts',
    dataIndex: 'alertsCount',
    key: 'alertsCount',
    width: 100,
  },
];

type Props = RouteComponentProps;

const List = (_props: Props) => {
  useBreadcrumbs(['Security', 'Security Server', 'Channels']);
  const { containerRef, scrollY } = useListScrollY();
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const { data, loading, refetch } = useQuery(ALL_SECURITY_SERVER_CHANNELS, {
    variables: { includeDeleted },
  });

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const channels = (data?.allSecurityServerChannels ?? []).filter(
    (row): row is ChannelRow => row != null
  );
  const pageRows = channels.slice(
    pageIndex * pageSize,
    (pageIndex + 1) * pageSize
  );

  const handleRefresh = () =>
    refetch().then(() => {
      message.success('Data Reloaded', 2);
    });

  const getTableHeader = () => (
    <div className="list-table-header">
      <div className="list-table-header-section" />
      <div className="list-table-header-utilities">
        <Space size={8}>
          <Checkbox
            checked={includeDeleted}
            onChange={event => {
              setIncludeDeleted(event.target.checked);
              setPageIndex(0);
            }}
          >
            Include deleted
          </Checkbox>
          <Button
            icon={<SyncOutlined />}
            onClick={handleRefresh}
            title="Reload Data"
          />
        </Space>
      </div>
    </div>
  );

  return (
    <div className="list-container" ref={containerRef}>
      <Table
        className="list-table"
        rowKey="_id"
        dataSource={pageRows}
        columns={columns}
        title={getTableHeader}
        size="middle"
        bordered
        tableLayout="fixed"
        pagination={false}
        scroll={{ y: scrollY }}
        footer={() => (
          <Pagination
            current={pageIndex + 1}
            pageSize={pageSize}
            showSizeChanger
            showTotal={(total: number, range: [number, number]) =>
              `${range[0]}-${range[1]} of ${total} items`
            }
            onChange={(page, size) => {
              setPageIndex(size !== pageSize ? 0 : page - 1);
              setPageSize(size);
            }}
            total={channels.length}
          />
        )}
      />
    </div>
  );
};

export default List;
