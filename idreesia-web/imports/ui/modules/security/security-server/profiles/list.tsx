import React, { useState } from 'react';
import { type RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  Button,
  Pagination,
  Popconfirm,
  Space,
  Table,
  Tabs,
  Tooltip,
  Typography,
} from 'antd';
import {
  DeleteOutlined,
  PictureOutlined,
  PlusCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';

import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import type { PagedSecurityServerProfilesQuery } from 'meteor/idreesia-common/types/client-operations';
import { message } from '/imports/ui/antd-feedback';

import paths from '../../submodule-paths';
import {
  CREATE_SECURITY_SERVER_PROFILE,
  DELETE_SECURITY_SERVER_PROFILE,
  PAGED_SECURITY_SERVER_PROFILES,
  UPDATE_SECURITY_SERVER_PROFILE,
} from '../gql';
import useCanManage from '../common/use-can-manage';
import ProfileFormModal, { type ProfileFormValues } from './profile-form-modal';
import ProfileImagesDrawer from './profile-images-drawer';

type Profile = NonNullable<
  NonNullable<
    NonNullable<
      PagedSecurityServerProfilesQuery['pagedSecurityServerProfiles']
    >['data']
  >[number]
>;

type TabKey = 'live-profiles' | 'test-profiles';

// The watch list is small, so both tabs are split and paged on the client
// from a single fetch, as on the security server.
const ALL_PROFILES_FILTER = { includeTest: 'true', pageSize: '1000' };
const refetchQueries = ['pagedSecurityServerProfiles'];

type Props = RouteComponentProps;

const List = (_props: Props) => {
  useBreadcrumbs(['Security', 'Security Server', 'Profiles']);
  const canManage = useCanManage();
  const [activeTab, setActiveTab] = useState<TabKey>('live-profiles');
  const [formOpen, setFormOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [imagesProfileId, setImagesProfileId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { data, loading, refetch } = useQuery(PAGED_SECURITY_SERVER_PROFILES, {
    variables: { filter: ALL_PROFILES_FILTER },
    notifyOnNetworkStatusChange: true,
  });
  const [createProfile, { loading: creating }] = useMutation(
    CREATE_SECURITY_SERVER_PROFILE,
    { refetchQueries }
  );
  const [updateProfile, { loading: updating }] = useMutation(
    UPDATE_SECURITY_SERVER_PROFILE,
    { refetchQueries }
  );
  const [deleteProfile] = useMutation(DELETE_SECURITY_SERVER_PROFILE, {
    refetchQueries,
  });

  const profiles = (data?.pagedSecurityServerProfiles?.data ?? []).filter(
    (row): row is Profile => row != null
  );
  const filtered = profiles.filter(profile =>
    activeTab === 'test-profiles' ? profile.isTest : !profile.isTest
  );
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const showError = (error: Error) => message.error(error.message, 5);

  const closeForm = () => {
    setFormOpen(false);
    setEditingProfile(null);
  };

  const openForm = (profile: Profile | null) => {
    setEditingProfile(profile);
    setFormOpen(true);
  };

  const handleSubmit = (values: ProfileFormValues) => {
    if (editingProfile) {
      updateProfile({ variables: { _id: editingProfile._id!, ...values } })
        .then(() => {
          message.success('Profile updated', 2);
          closeForm();
        })
        .catch(showError);
    } else {
      createProfile({ variables: values })
        .then(() => {
          message.success('Profile created', 2);
          closeForm();
        })
        .catch(showError);
    }
  };

  const handleDelete = (profile: Profile) =>
    deleteProfile({ variables: { _id: profile._id! } })
      .then(() => {
        message.success('Profile deleted', 2);
      })
      .catch(showError);

  const handleRefresh = () =>
    refetch().then(() => {
      message.success('Data Reloaded', 2);
    });

  // Above the tabs, so it isn't the table's own title as on other lists.
  const toolbar = (
    <div className="list-table-header security-server-toolbar">
      <Space size={12}>
        {canManage ? (
          <Button
            type="primary"
            icon={<PlusCircleOutlined />}
            onClick={() => openForm(null)}
          >
            New Profile
          </Button>
        ) : null}
      </Space>
      <div className="list-table-header-utilities">
        <Button
          icon={<SyncOutlined />}
          onClick={handleRefresh}
          title="Reload Data"
        />
      </div>
    </div>
  );

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Profile) => (
        <Typography.Link onClick={() => openForm(record)}>
          {name}
        </Typography.Link>
      ),
    },
    {
      title: 'Photos',
      key: 'photos',
      render: (_text: unknown, record: Profile) => record.images?.length ?? 0,
    },
    {
      title: 'Alerts',
      dataIndex: 'alertsCount',
      key: 'alertsCount',
      render: (count: number | null, record: Profile) =>
        count ? (
          <Link
            to={`${paths.securityServerAlertsPath}?profileId=${record._id}`}
          >
            {count}
          </Link>
        ) : (
          count
        ),
    },
    {
      title: '',
      key: 'actions',
      width: 88,
      align: 'right' as const,
      render: (_text: unknown, record: Profile) => (
        <div className="list-actions-column">
          <Tooltip title="Photos">
            <PictureOutlined
              className="list-actions-icon"
              onClick={() => setImagesProfileId(record._id!)}
            />
          </Tooltip>
          {canManage ? (
            <Popconfirm
              title="Delete this profile?"
              description="This also deletes its photos. Its alerts are kept."
              onConfirm={() => handleDelete(record)}
            >
              <Tooltip title="Delete">
                <DeleteOutlined className="list-actions-icon" />
              </Tooltip>
            </Popconfirm>
          ) : null}
        </div>
      ),
    },
  ];

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

      <ProfileFormModal
        open={formOpen}
        profile={editingProfile}
        defaultIsTest={activeTab === 'test-profiles'}
        readOnly={!canManage}
        confirmLoading={creating || updating}
        onCancel={closeForm}
        onSubmit={handleSubmit}
      />

      <ProfileImagesDrawer
        profileId={imagesProfileId}
        canManage={canManage}
        onClose={() => setImagesProfileId(null)}
      />
    </div>
  );
};

export default List;
