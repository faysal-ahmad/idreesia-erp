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
  Tooltip,
  Typography,
} from 'antd';
import {
  DeleteOutlined,
  PlusCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';

import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import { message } from '/imports/ui/antd-feedback';

import paths from '../../submodule-paths';
import {
  ALL_SECURITY_SERVER_CHANNELS,
  CREATE_SECURITY_SERVER_CHANNEL,
  DELETE_SECURITY_SERVER_CHANNEL,
  UPDATE_SECURITY_SERVER_CHANNEL,
} from '../gql';
import useCanManage from '../common/use-can-manage';
import ChannelFormModal, {
  DEFAULT_MIN_FACE_QUALITY,
  DEFAULT_MIN_FACE_SIZE_PX,
  DEFAULT_RECOGNITION_FPS,
  DEFAULT_SIMILARITY_THRESHOLD,
  toChannelFormValues,
  toChannelVariables,
  type Channel,
  type ChannelFormValues,
} from './channel-form-modal';

const refetchQueries = ['allSecurityServerChannels'];

// null = the security server's default; 0 turns the check off.
const formatFaceMinimum = (
  value: number | null,
  defaultValue: number,
  unit = ''
) => {
  const minimum = value ?? defaultValue;
  if (minimum === 0) return 'Off';
  return `${minimum}${unit}`;
};

type Props = RouteComponentProps;

const List = (_props: Props) => {
  useBreadcrumbs(['Security', 'Security Server', 'Channels']);
  const canManage = useCanManage();
  const [formOpen, setFormOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { data, loading, refetch } = useQuery(ALL_SECURITY_SERVER_CHANNELS, {
    variables: { includeDeleted: false },
    notifyOnNetworkStatusChange: true,
  });
  const [createChannel, { loading: creating }] = useMutation(
    CREATE_SECURITY_SERVER_CHANNEL,
    { refetchQueries }
  );
  const [updateChannel, { loading: updating }] = useMutation(
    UPDATE_SECURITY_SERVER_CHANNEL,
    { refetchQueries }
  );
  const [toggleChannel, { loading: toggling }] = useMutation(
    UPDATE_SECURITY_SERVER_CHANNEL,
    { refetchQueries }
  );
  const [deleteChannel] = useMutation(DELETE_SECURITY_SERVER_CHANNEL, {
    refetchQueries,
  });

  const channels = (data?.allSecurityServerChannels ?? []).filter(
    (row): row is Channel => row != null
  );

  const showError = (error: Error) => message.error(error.message, 5);

  const closeForm = () => {
    setFormOpen(false);
    setEditingChannel(null);
  };

  const openForm = (channel: Channel | null) => {
    setEditingChannel(channel);
    setFormOpen(true);
  };

  const handleSubmit = (values: ChannelFormValues) => {
    const variables = toChannelVariables(values);
    if (editingChannel) {
      updateChannel({ variables: { _id: editingChannel._id!, ...variables } })
        .then(() => {
          message.success('Channel updated', 2);
          closeForm();
        })
        .catch(showError);
    } else {
      createChannel({ variables })
        .then(() => {
          message.success('Channel created', 2);
          closeForm();
        })
        .catch(showError);
    }
  };

  // Saves only the enabled flag, from the channel as stored - not from
  // whatever is being edited in the form.
  const handleToggleEnabled = (channel: Channel, enabled: boolean) => {
    const variables = toChannelVariables({
      ...toChannelFormValues(channel),
      enabled,
    });
    toggleChannel({ variables: { _id: channel._id!, ...variables } })
      .then(() => {
        message.success(enabled ? 'Channel enabled' : 'Channel disabled', 2);
      })
      .catch(showError);
  };

  const handleDelete = (channel: Channel) =>
    deleteChannel({ variables: { _id: channel._id! } })
      .then(() => {
        message.success('Channel deleted', 2);
      })
      .catch(showError);

  const handleRefresh = () =>
    refetch().then(() => {
      message.success('Data Reloaded', 2);
    });

  const getTableHeader = () => (
    <div className="list-table-header">
      <Space size={12}>
        {canManage ? (
          <Button
            type="primary"
            icon={<PlusCircleOutlined />}
            onClick={() => openForm(null)}
          >
            New Channel
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
      render: (name: string, record: Channel) => (
        <Typography.Link onClick={() => openForm(record)}>
          {name}
        </Typography.Link>
      ),
    },
    {
      title: 'Enabled',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean | null) => (enabled ? 'Yes' : 'No'),
    },
    {
      title: 'Recognition Rate',
      dataIndex: 'recognitionFps',
      key: 'recognitionFps',
      render: (value: number | null) =>
        `${value ?? DEFAULT_RECOGNITION_FPS} fps`,
    },
    {
      title: 'Similarity Threshold',
      dataIndex: 'similarityThreshold',
      key: 'similarityThreshold',
      render: (value: number | null) =>
        (value ?? DEFAULT_SIMILARITY_THRESHOLD).toFixed(2),
    },
    {
      title: 'Min Face Size',
      dataIndex: 'minFaceSizePx',
      key: 'minFaceSizePx',
      render: (value: number | null) =>
        formatFaceMinimum(value, DEFAULT_MIN_FACE_SIZE_PX, ' px'),
    },
    {
      title: 'Min Face Quality',
      dataIndex: 'minFaceQuality',
      key: 'minFaceQuality',
      render: (value: number | null) =>
        formatFaceMinimum(value, DEFAULT_MIN_FACE_QUALITY),
    },
    {
      title: 'Alerts',
      dataIndex: 'alertsCount',
      key: 'alertsCount',
      render: (count: number | null, record: Channel) =>
        count ? (
          <Link
            to={`${paths.securityServerAlertsPath}?channelId=${record._id}`}
          >
            {count}
          </Link>
        ) : (
          count
        ),
    },
    ...(canManage
      ? [
          {
            title: '',
            key: 'actions',
            width: 80,
            align: 'right' as const,
            render: (_text: unknown, record: Channel) => {
              const deleteDisabled = (record.alertsCount ?? 0) > 0;
              return (
                <div className="list-actions-column">
                  <Tooltip
                    title={
                      deleteDisabled
                        ? 'This channel has alert history and cannot be deleted.'
                        : 'Delete'
                    }
                  >
                    <Popconfirm
                      title="Delete this channel?"
                      disabled={deleteDisabled}
                      onConfirm={() => handleDelete(record)}
                    >
                      <DeleteOutlined
                        className={
                          deleteDisabled
                            ? 'list-actions-icon security-server-action-disabled'
                            : 'list-actions-icon'
                        }
                      />
                    </Popconfirm>
                  </Tooltip>
                </div>
              );
            },
          },
        ]
      : []),
  ];

  return (
    <div>
      <div className="list-container">
        <Table
          className="list-table"
          bordered
          size="middle"
          rowKey="_id"
          loading={loading}
          dataSource={channels.slice((page - 1) * pageSize, page * pageSize)}
          columns={columns}
          title={getTableHeader}
          pagination={false}
          footer={() => (
            <Pagination
              current={page}
              pageSize={pageSize}
              total={channels.length}
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

      <ChannelFormModal
        open={formOpen}
        channel={editingChannel}
        readOnly={!canManage}
        confirmLoading={creating || updating}
        togglingEnabled={toggling}
        onCancel={closeForm}
        onSubmit={handleSubmit}
        onToggleEnabled={handleToggleEnabled}
      />
    </div>
  );
};

export default List;
