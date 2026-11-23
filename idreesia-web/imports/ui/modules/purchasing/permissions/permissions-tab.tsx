import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { SyncOutlined, TeamOutlined, UserAddOutlined } from '@ant-design/icons';
import { Button, Drawer, Modal, Space, Table, Tag, Tooltip } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import type { KarkunSelectionItem } from '/imports/ui/modules/helpers/controls';

import {
  ADD_PURCHASING_PERMISSION_GROUP,
  ADD_PURCHASING_PERMISSION_USER,
  PURCHASING_USER_GROUPS,
  REMOVE_PURCHASING_PERMISSION_GROUP,
  PURCHASING_PERMISSION_ASSIGNMENTS,
  REMOVE_PURCHASING_PERMISSION_USER,
} from './gql';
import KarkunPicker from './karkun-picker';

const REFETCH = ['purchasingPermissionAssignments', 'purchasingUserGroups'];

interface HolderEntry {
  userId: string;
  personId?: string | null;
  label: string;
}

interface GroupEntry {
  groupId: string;
  name: string;
}

interface PermissionRow {
  key: string;
  permissionKey: string;
  name: string;
  description: string;
  users: HolderEntry[];
  groups: GroupEntry[];
}

interface FeatureRow {
  key: string;
  name: string;
  children: PermissionRow[];
}

const userLabel = (user: { username?: string | null; displayName?: string | null; userId?: string | null }) =>
  user.displayName ? `${user.displayName} (${user.username ?? ''})` : (user.username ?? user.userId ?? '');

const isPermission = (record: FeatureRow | PermissionRow): record is PermissionRow =>
  'permissionKey' in record;

const reportError = (error: Error) => message.error(error.message, 5);

/**
 * Who holds each Purchasing permission, with the users added and removed
 * here.
 */
const PermissionsTab = () => {
  const [adding, setAdding] = useState<PermissionRow | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addingGroup, setAddingGroup] = useState<PermissionRow | null>(null);
  const [addingGroupId, setAddingGroupId] = useState<string | null>(null);

  const { data, loading, refetch } = useQuery(PURCHASING_PERMISSION_ASSIGNMENTS, {
    fetchPolicy: 'cache-and-network',
  });
  const [addUser] = useMutation(ADD_PURCHASING_PERMISSION_USER, { refetchQueries: REFETCH });
  const [removeUser] = useMutation(REMOVE_PURCHASING_PERMISSION_USER, { refetchQueries: REFETCH });
  const [addGroup] = useMutation(ADD_PURCHASING_PERMISSION_GROUP, { refetchQueries: REFETCH });
  const [removeGroup] = useMutation(REMOVE_PURCHASING_PERMISSION_GROUP, { refetchQueries: REFETCH });
  const { data: groupsData, loading: groupsLoading } = useQuery(PURCHASING_USER_GROUPS, {
    skip: addingGroup == null,
    fetchPolicy: 'cache-and-network',
  });

  const rows: FeatureRow[] = (data?.purchasingPermissionAssignments ?? []).flatMap((group) =>
    group?.featureKey
      ? [
          {
            key: `feature:${group.featureKey}`,
            name: group.featureName,
            children: (group.permissions ?? []).flatMap((permission) =>
              permission?.key
                ? [
                    {
                      key: `${group.featureKey}:${permission.key}`,
                      permissionKey: permission.key,
                      name: permission.name,
                      description: permission.description ?? '',
                      users: (permission.users ?? []).flatMap((user) =>
                        user?.userId
                          ? [{ userId: user.userId, personId: user.personId, label: userLabel(user) }]
                          : []
                      ),
                      groups: (permission.groups ?? []).flatMap((group) =>
                        group?.groupId ? [{ groupId: group.groupId, name: group.name }] : []
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
  const addingRow = rows.flatMap((feature) => feature.children).find((row) => row.key === adding?.key);

  const handleAdd = (karkun: KarkunSelectionItem) => {
    if (!adding) return;
    setAddingId(karkun._id);
    addUser({ variables: { permissionKey: adding.permissionKey, karkunId: karkun._id } })
      .then(() => message.success(`${karkun.name} added to "${adding.name}".`, 3))
      .catch(reportError)
      .finally(() => setAddingId(null));
  };

  const addingGroupRow = rows
    .flatMap((feature) => feature.children)
    .find((row) => row.key === addingGroup?.key);

  const handleAddGroup = (group: { _id: string; name: string }) => {
    if (!addingGroup) return;
    setAddingGroupId(group._id);
    addGroup({ variables: { permissionKey: addingGroup.permissionKey, groupId: group._id } })
      .then(() => message.success(`${group.name} added to "${addingGroup.name}".`, 3))
      .catch(reportError)
      .finally(() => setAddingGroupId(null));
  };

  const confirmRemoveGroup = (record: PermissionRow, group: GroupEntry) => {
    Modal.confirm({
      title: `Remove the group ${group.name} from "${record.name}"?`,
      okText: 'Yes',
      cancelText: 'No',
      onOk: () =>
        removeGroup({ variables: { permissionKey: record.permissionKey, groupId: group.groupId } }).catch(
          reportError
        ),
    });
  };

  const confirmRemove = (record: PermissionRow, user: HolderEntry) => {
    Modal.confirm({
      title: `Remove ${user.label} from "${record.name}"?`,
      okText: 'Yes',
      cancelText: 'No',
      onOk: () =>
        removeUser({ variables: { permissionKey: record.permissionKey, userId: user.userId } }).catch(
          reportError
        ),
    });
  };

  const columns: any[] = [
    {
      title: 'Permissions',
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
      title: 'Users & Groups',
      key: 'users',
      render: (_text: unknown, record: FeatureRow | PermissionRow) =>
        isPermission(record) ? (
          <Space size={[4, 4]} wrap>
            {record.users.map((user) => (
              <Tag
                key={user.userId}
                closable
                onClose={(event) => {
                  event.preventDefault();
                  confirmRemove(record, user);
                }}
              >
                {user.label}
              </Tag>
            ))}
            {record.groups.map((group) => (
              <Tag
                key={`group-${group.groupId}`}
                color="blue"
                closable
                onClose={(event) => {
                  event.preventDefault();
                  confirmRemoveGroup(record, group);
                }}
              >
                {group.name}
              </Tag>
            ))}
          </Space>
        ) : null,
    },
    {
      key: 'action',
      width: 96,
      render: (_text: unknown, record: FeatureRow | PermissionRow) =>
        isPermission(record) ? (
          <div className="list-actions-column">
            <Tooltip title="Add user">
              <UserAddOutlined className="list-actions-icon" onClick={() => setAdding(record)} />
            </Tooltip>
            <Tooltip title="Add group">
              <TeamOutlined className="list-actions-icon" onClick={() => setAddingGroup(record)} />
            </Tooltip>
          </div>
        ) : null,
    },
  ];

  return (
    <>
      <div className="list-container">
        <Table
          className="list-table"
          rowKey="key"
          dataSource={rows}
          columns={columns}
          title={() => (
            <div className="list-table-header">
              <div />
              <div className="list-table-header-utilities">
                <Space size={8}>
                  <Button
                    icon={<SyncOutlined />}
                    title="Reload Data"
                    onClick={() => refetch().then(() => message.success('Data Reloaded', 2))}
                  />
                </Space>
              </div>
            </div>
          )}
          loading={loading && !data}
          bordered
          size="middle"
          tableLayout="fixed"
          pagination={false}
          // Rows only render once the data is there, so expand them all then.
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
          selectedIds={(addingRow?.users ?? []).flatMap((user) => (user.personId ? [user.personId] : []))}
          addingId={addingId}
          onAdd={handleAdd}
        />
      </Drawer>

      <Drawer
        title={addingGroup ? `Add Group to "${addingGroup.name}"` : 'Add Group'}
        width={720}
        open={addingGroup != null}
        onClose={() => setAddingGroup(null)}
        destroyOnHidden
      >
        <Table
          className="list-table"
          rowKey="_id"
          size="small"
          bordered
          loading={groupsLoading && !groupsData}
          pagination={false}
          locale={{ emptyText: 'No user groups yet. Create one on the User Groups tab.' }}
          dataSource={(groupsData?.purchasingUserGroups ?? []).filter((group) => group?._id != null) as any[]}
          columns={[
            { title: 'User Group', dataIndex: 'name' },
            { title: 'Description', dataIndex: 'description' },
            {
              title: 'Users',
              key: 'count',
              width: 80,
              align: 'right' as const,
              render: (_: unknown, group: any) => group.users?.length ?? 0,
            },
            {
              key: 'action',
              width: 110,
              render: (_: unknown, group: any) =>
                (addingGroupRow?.groups ?? []).some((held) => held.groupId === group._id) ? (
                  <Tag>Added</Tag>
                ) : (
                  <Button
                    size="small"
                    type="primary"
                    loading={addingGroupId === group._id}
                    onClick={() => handleAddGroup(group)}
                  >
                    Add
                  </Button>
                ),
            },
          ]}
        />
      </Drawer>
    </>
  );
};

export default PermissionsTab;
