import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import {
  Avatar,
  Button,
  Empty,
  Flex,
  Image,
  Pagination,
  Space,
  Spin,
  Table,
  Tabs,
  Typography,
} from 'antd';
import { SyncOutlined, UserOutlined } from '@ant-design/icons';

import type { WorkspaceMonitoringProfilesQuery } from 'meteor/idreesia-common/types/client-operations';
import { message } from '/imports/ui/antd-feedback';

import { WORKSPACE_MONITORING_PROFILES } from './gql';

type Profile = NonNullable<
  NonNullable<
    NonNullable<
      WorkspaceMonitoringProfilesQuery['workspaceMonitoringProfiles']
    >['data']
  >[number]
>;

type Photo = NonNullable<NonNullable<Profile['photos']>[number]>;

type TabKey = 'live-profiles' | 'test-profiles';

const getPhotos = (profile: Profile) =>
  (profile.photos ?? []).filter(
    (photo): photo is Photo => photo != null && !!photo.imageUrl
  );

// The default photo (first) as a thumbnail; its full image for photos stored
// before thumbnails existed.
const getThumbnailUrl = (profile: Profile) => {
  const [photo] = getPhotos(profile);
  return photo?.thumbnailUrl || photo?.imageUrl || undefined;
};

// The watch list is small, so both tabs are split and paged on the client
// from a single fetch, as on Security → Security Server → Profiles.
const ALL_PROFILES_PAGE_SIZE = '1000';

/**
 * Workspaces → committee → Monitoring Profiles: the people the security
 * server watches for, with their photos and alert counts. Read-only.
 */
const List = () => {
  const { committeeId } = useParams<{ committeeId: string }>();
  const [activeTab, setActiveTab] = useState<TabKey>('live-profiles');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [previewProfile, setPreviewProfile] = useState<Profile | null>(null);

  const { data, loading, error, refetch } = useQuery(
    WORKSPACE_MONITORING_PROFILES,
    {
      variables: {
        committeeId: committeeId!,
        pageIndex: '0',
        pageSize: ALL_PROFILES_PAGE_SIZE,
      },
      skip: !committeeId,
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
    }
  );

  if (loading && !data) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: 240 }}>
        <Spin />
      </Flex>
    );
  }

  if (error && !data) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: 240 }}>
        <Empty description={error.message} />
      </Flex>
    );
  }

  const profiles = (data?.workspaceMonitoringProfiles?.data ?? []).filter(
    (row): row is Profile => row != null && row._id != null
  );
  const filtered = profiles.filter(profile =>
    activeTab === 'test-profiles' ? profile.isTest : !profile.isTest
  );
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleRefresh = () =>
    refetch().then(() => {
      message.success('Data Reloaded', 2);
    });

  const openPreview = (profile: Profile) => {
    if (getPhotos(profile).length > 0) setPreviewProfile(profile);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Profile) => (
        <div className="security-server-profile-name">
          <Avatar
            shape="square"
            size={40}
            icon={<UserOutlined />}
            src={getThumbnailUrl(record)}
          />
          {name}
        </div>
      ),
    },
    {
      title: 'Photos',
      key: 'photos',
      render: (_text: unknown, record: Profile) => {
        const count = getPhotos(record).length;
        return count ? (
          <Typography.Link onClick={() => openPreview(record)}>
            {count}
          </Typography.Link>
        ) : (
          0
        );
      },
    },
    {
      title: 'Alerts',
      dataIndex: 'alertsCount',
      key: 'alertsCount',
    },
  ];

  const toolbar = (
    <div className="list-table-header security-server-toolbar">
      <Typography.Text strong>Profiles</Typography.Text>
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
  );

  return (
    <div>
      {toolbar}
      <Tabs
        activeKey={activeTab}
        onChange={key => {
          setActiveTab(key as TabKey);
          setPage(1);
        }}
        items={[
          { key: 'live-profiles', label: 'Live Profiles' },
          { key: 'test-profiles', label: 'Test Profiles' },
        ]}
      />

      <div className="list-container">
        <Table
          className="list-table"
          bordered
          size="middle"
          rowKey="_id"
          loading={loading}
          dataSource={paged}
          columns={columns}
          pagination={false}
          footer={() => (
            <Pagination
              current={page}
              pageSize={pageSize}
              total={filtered.length}
              showSizeChanger
              showTotal={(total: number, range: [number, number]) =>
                `${range[0]}-${range[1]} of ${total} items`
              }
              onChange={(nextPage, nextPageSize) => {
                setPage(nextPage);
                setPageSize(nextPageSize);
              }}
            />
          )}
        />
      </div>

      {previewProfile ? (
        <Image.PreviewGroup
          items={getPhotos(previewProfile).map(photo => photo.imageUrl!)}
          preview={{
            open: true,
            onOpenChange: open => {
              if (!open) setPreviewProfile(null);
            },
          }}
        />
      ) : null}
    </div>
  );
};

export default List;
