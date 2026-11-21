import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import { SyncOutlined, UserAddOutlined } from '@ant-design/icons';
import { Button, Drawer, Modal, Space, Table, Tag, Tooltip } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import { MehfilPermissionsPermissions } from 'meteor/idreesia-common/constants/mehfil-permissions';
import type { KarkunSelectionItem } from '/imports/ui/modules/helpers/controls';

import KarkunPicker from './karkun-picker';
import {
  WORKSPACE_ADD_MEHFIL_PERMISSION_USER,
  WORKSPACE_MEHFIL_PERMISSIONS,
  WORKSPACE_REMOVE_MEHFIL_PERMISSION_USER,
} from './gql';

// Changing permissions can change what the caller themselves can open, so the
// sidebar's lists are reloaded too.
const REFETCH = [
  'workspaceMehfilPermissions',
  'myMehfilPermissionsLocations',
  'myMehfilDetailsLocations',
  'myDutiesAttendanceLocations',
];

interface UserEntry {
  userId: string;
  personId?: string | null;
  label: string;
}

interface PermissionRow {
  key: string;
  featureKey: string;
  permissionKey: string;
  name: string;
  description: string;
  users: UserEntry[];
}

interface FeatureRow {
  key: string;
  name: string;
  children: PermissionRow[];
}

const userLabel = (user: {
  userId?: string | null;
  username?: string | null;
  displayName?: string | null;
}) =>
  user.displayName
    ? `${user.displayName} (${user.username ?? ''})`
    : (user.username ?? user.userId ?? '');

const isPermission = (
  record: FeatureRow | PermissionRow
): record is PermissionRow => 'permissionKey' in record;

// Who holds which permission on a mehfil, for each of its features. Those who
// can manage permissions add and remove users here; the others only look.
const MehfilPermissionsPage = () => {
  const { locationId } = useParams<{ locationId: string }>();
  const [adding, setAdding] = useState<PermissionRow | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);

  const { data, loading, refetch } = useQuery(WORKSPACE_MEHFIL_PERMISSIONS, {
    variables: { locationId },
    fetchPolicy: 'cache-and-network',
  });
  const [addUser] = useMutation(WORKSPACE_ADD_MEHFIL_PERMISSION_USER, {
    refetchQueries: REFETCH,
  });
  const [removeUser] = useMutation(WORKSPACE_REMOVE_MEHFIL_PERMISSION_USER, {
    refetchQueries: REFETCH,
  });

  const canManage = (data?.workspaceMehfilPermissions?.permissions ?? []).includes(
    MehfilPermissionsPermissions.MANAGE
  );

  const rows: FeatureRow[] = (
    data?.workspaceMehfilPermissions?.groups ?? []
  ).flatMap(group =>
    group?.featureKey
      ? [
          {
            key: `feature:${group.featureKey}`,
            name: group.featureName ?? group.featureKey,
            children: (group.permissions ?? []).flatMap(permission =>
              permission?.key
                ? [
                    {
                      key: `${group.featureKey}:${permission.key}`,
                      featureKey: group.featureKey,
                      permissionKey: permission.key,
                      name: permission.name ?? permission.key,
                      description: permission.description ?? '',
                      users: (permission.users ?? []).flatMap(user =>
                        user?.userId
                          ? [
                              {
                                userId: user.userId,
                                personId: user.personId,
                                label: userLabel(user),
                              },
                            ]
                          : []
                      ),
                    },
                  ]
                : []
            ),
          },
        ]
      : []
  );

  // The permission being added to, as of the latest data.
  const addingRow = rows
    .flatMap(feature => feature.children)
    .find(row => row.key === adding?.key);

  const handleAdd = (karkun: KarkunSelectionItem) => {
    if (!adding) return;
    setAddingId(karkun._id);
    addUser({
      variables: {
        locationId,
        featureKey: adding.featureKey,
        permissionKey: adding.permissionKey,
        karkunId: karkun._id,
      },
    })
      .then(() => {
        message.success(`${karkun.name} added to "${adding.name}".`, 3);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      })
      .finally(() => setAddingId(null));
  };

  const confirmRemove = (record: PermissionRow, user: UserEntry) => {
    Modal.confirm({
      title: `Remove ${user.label} from "${record.name}"?`,
      content:
        record.permissionKey === 'view'
          ? 'This also removes any other permissions that depend on it.'
          : undefined,
      okText: 'Yes',
      cancelText: 'No',
      onOk: () =>
        removeUser({
          variables: {
            locationId,
            featureKey: record.featureKey,
            permissionKey: record.permissionKey,
            userId: user.userId,
          },
        }).catch((error: Error) => {
          message.error(error.message, 5);
        }),
    });
  };

  const columns: any[] = [
    {
      title: 'Feature Permissions',
      key: 'name',
      width: '35%',
      render: (_text: unknown, record: FeatureRow | PermissionRow) =>
        isPermission(record) ? (
          <Tooltip title={record.description}>{record.name}</Tooltip>
        ) : (
          <strong>{record.name}</strong>
        ),
    },
    {
      title: 'Users',
      key: 'users',
      render: (_text: unknown, record: FeatureRow | PermissionRow) =>
        isPermission(record) ? (
          <Space size={[4, 4]} wrap>
            {record.users.map(user => (
              <Tag
                key={user.userId}
                closable={canManage}
                onClose={event => {
                  event.preventDefault();
                  confirmRemove(record, user);
                }}
              >
                {user.label}
              </Tag>
            ))}
          </Space>
        ) : null,
    },
    ...(canManage
      ? [
          {
            key: 'action',
            width: 64,
            render: (_text: unknown, record: FeatureRow | PermissionRow) =>
              isPermission(record) ? (
                <div className="list-actions-column">
                  <Tooltip title="Add user">
                    <UserAddOutlined
                      className="list-actions-icon"
                      onClick={() => setAdding(record)}
                    />
                  </Tooltip>
                </div>
              ) : null,
          },
        ]
      : []),
  ];

  const getTableHeader = () => (
    <div className="list-table-header">
      <Space size={12} />
      <div className="list-table-header-utilities">
        <Space size={8}>
          <Button
            icon={<SyncOutlined />}
            title="Reload Data"
            onClick={() =>
              refetch().then(() => {
                message.success('Data Reloaded', 2);
              })
            }
          />
        </Space>
      </div>
    </div>
  );

  return (
    <>
      <div className="list-container">
        <Table
          className="list-table"
          rowKey="key"
          dataSource={rows}
          columns={columns}
          title={getTableHeader}
          loading={loading && !data}
          bordered
          size="middle"
          tableLayout="fixed"
          pagination={false}
          // Rows are only rendered once the data is there, so expanding them
          // all by default catches every feature.
          key={data ? 'loaded' : 'loading'}
          expandable={{ defaultExpandAllRows: true }}
          locale={{ emptyText: 'No permissions available' }}
        />
      </div>

      <Drawer
        title={adding ? `Add User to "${adding.name}"` : 'Add User'}
        width={900}
        open={adding != null}
        onClose={() => setAdding(null)}
        destroyOnHidden
      >
        <KarkunPicker
          locationId={locationId}
          selectedIds={(addingRow?.users ?? []).flatMap(user =>
            user.personId ? [user.personId] : []
          )}
          addingId={addingId}
          onAdd={handleAdd}
        />
      </Drawer>
    </>
  );
};

export default MehfilPermissionsPage;
