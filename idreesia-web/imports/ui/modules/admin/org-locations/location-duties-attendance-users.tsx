import React, { useState } from 'react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  DeleteOutlined,
  EditOutlined,
  SyncOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import {
  Button,
  Checkbox,
  Form,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import { message } from '/imports/ui/antd-feedback';

import { DutiesAttendancePermissions } from 'meteor/idreesia-common/constants/duties-attendance';
import type {
  AddOrgLocationDutiesAttendanceUserMutation,
  AddOrgLocationDutiesAttendanceUserMutationVariables,
  AllDutiesAttendancePermissionsQuery,
  AllDutiesAttendancePermissionsQueryVariables,
  DutiesAttendanceUserCandidatesQuery,
  DutiesAttendanceUserCandidatesQueryVariables,
  OrgLocationDutiesAttendanceUsersQuery,
  OrgLocationDutiesAttendanceUsersQueryVariables,
  RemoveOrgLocationDutiesAttendanceUserMutation,
  RemoveOrgLocationDutiesAttendanceUserMutationVariables,
  UpdateOrgLocationDutiesAttendanceUserPermissionsMutation,
  UpdateOrgLocationDutiesAttendanceUserPermissionsMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ORG_LOCATION_DUTIES_ATTENDANCE_USERS: TypedDocumentNode<
  OrgLocationDutiesAttendanceUsersQuery,
  OrgLocationDutiesAttendanceUsersQueryVariables
> = gql`
  query orgLocationDutiesAttendanceUsers($locationId: String!) {
    orgLocationDutiesAttendanceUsers(locationId: $locationId) {
      _id
      userId
      username
      displayName
      permissions
    }
  }
`;

const ALL_DUTIES_ATTENDANCE_PERMISSIONS: TypedDocumentNode<
  AllDutiesAttendancePermissionsQuery,
  AllDutiesAttendancePermissionsQueryVariables
> = gql`
  query allDutiesAttendancePermissions {
    allDutiesAttendancePermissions {
      key
      name
      description
    }
  }
`;

const DUTIES_ATTENDANCE_USER_CANDIDATES: TypedDocumentNode<
  DutiesAttendanceUserCandidatesQuery,
  DutiesAttendanceUserCandidatesQueryVariables
> = gql`
  query dutiesAttendanceUserCandidates($search: String) {
    dutiesAttendanceUserCandidates(search: $search) {
      _id
      username
      displayName
    }
  }
`;

const ADD_USER: TypedDocumentNode<
  AddOrgLocationDutiesAttendanceUserMutation,
  AddOrgLocationDutiesAttendanceUserMutationVariables
> = gql`
  mutation addOrgLocationDutiesAttendanceUser(
    $locationId: String!
    $userId: String!
    $permissions: [String]!
  ) {
    addOrgLocationDutiesAttendanceUser(
      locationId: $locationId
      userId: $userId
      permissions: $permissions
    ) {
      _id
    }
  }
`;

const UPDATE_USER_PERMISSIONS: TypedDocumentNode<
  UpdateOrgLocationDutiesAttendanceUserPermissionsMutation,
  UpdateOrgLocationDutiesAttendanceUserPermissionsMutationVariables
> = gql`
  mutation updateOrgLocationDutiesAttendanceUserPermissions(
    $locationId: String!
    $userId: String!
    $permissions: [String]!
  ) {
    updateOrgLocationDutiesAttendanceUserPermissions(
      locationId: $locationId
      userId: $userId
      permissions: $permissions
    ) {
      _id
    }
  }
`;

const REMOVE_USER: TypedDocumentNode<
  RemoveOrgLocationDutiesAttendanceUserMutation,
  RemoveOrgLocationDutiesAttendanceUserMutationVariables
> = gql`
  mutation removeOrgLocationDutiesAttendanceUser(
    $locationId: String!
    $userId: String!
  ) {
    removeOrgLocationDutiesAttendanceUser(
      locationId: $locationId
      userId: $userId
    )
  }
`;

const REFETCH = ['orgLocationDutiesAttendanceUsers', 'myDutiesAttendanceLocations'];

interface UserRow {
  _id: string;
  userId: string;
  username?: string | null;
  displayName?: string | null;
  permissions: string[];
}

interface FormValues {
  userId?: string;
  permissions: string[];
}

interface Props {
  locationId: string;
}

// The users of a mehfil's Duties and Attendance workspace and what each may do
// there. Managed here, by admins, rather than inside the workspace.
const LocationDutiesAttendanceUsers = ({ locationId }: Props) => {
  const [form] = Form.useForm<FormValues>();
  const [modal, setModal] = useState<{ editing: UserRow | null } | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const { data, loading, refetch } = useQuery(
    ORG_LOCATION_DUTIES_ATTENDANCE_USERS,
    { variables: { locationId }, fetchPolicy: 'cache-and-network' }
  );
  const { data: permissionData } = useQuery(ALL_DUTIES_ATTENDANCE_PERMISSIONS);
  const { data: candidateData, loading: searching } = useQuery(
    DUTIES_ATTENDANCE_USER_CANDIDATES,
    {
      variables: { search },
      skip: !modal || modal.editing != null,
      fetchPolicy: 'network-only',
    }
  );
  const [addUser] = useMutation(ADD_USER, { refetchQueries: REFETCH });
  const [updatePermissions] = useMutation(UPDATE_USER_PERMISSIONS, {
    refetchQueries: REFETCH,
  });
  const [removeUser] = useMutation(REMOVE_USER, { refetchQueries: REFETCH });

  const users: UserRow[] = (data?.orgLocationDutiesAttendanceUsers ?? []).flatMap(
    user =>
      user?._id && user.userId
        ? [
            {
              _id: user._id,
              userId: user.userId,
              username: user.username,
              displayName: user.displayName,
              permissions: (user.permissions ?? []).filter(
                (permission): permission is string => permission != null
              ),
            },
          ]
        : []
  );
  const permissionInfos = (permissionData?.allDutiesAttendancePermissions ?? []).filter(
    info => info?.key != null && info.name != null
  );
  const nameOf = (key: string) =>
    permissionInfos.find(info => info?.key === key)?.name ?? key;

  const candidates = (candidateData?.dutiesAttendanceUserCandidates ?? [])
    .flatMap(user =>
      user?._id && !users.some(existing => existing.userId === user._id)
        ? [
            {
              value: user._id,
              label: user.displayName
                ? `${user.displayName} (${user.username ?? ''})`
                : (user.username ?? user._id),
            },
          ]
        : []
    );

  const openModal = (editing: UserRow | null) => {
    form.resetFields();
    form.setFieldsValue({
      userId: editing?.userId,
      permissions: editing?.permissions ?? [DutiesAttendancePermissions.VIEW],
    });
    setSearch('');
    setModal({ editing });
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      if (modal?.editing) {
        await updatePermissions({
          variables: {
            locationId,
            userId: modal.editing.userId,
            permissions: values.permissions,
          },
        });
        message.success('Permissions saved', 2);
      } else {
        await addUser({
          variables: {
            locationId,
            userId: values.userId as string,
            permissions: values.permissions,
          },
        });
        message.success('User added', 2);
      }
      setModal(null);
    } catch (error) {
      message.error((error as Error).message, 5);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = (userId: string) => {
    removeUser({ variables: { locationId, userId } }).catch((error: Error) => {
      message.error(error.message, 5);
    });
  };

  const columns: any[] = [
    {
      title: 'User',
      key: 'user',
      render: (_text: unknown, record: UserRow) =>
        record.displayName
          ? `${record.displayName} (${record.username ?? ''})`
          : (record.username ?? record.userId),
    },
    {
      title: 'Permissions',
      key: 'permissions',
      render: (_text: unknown, record: UserRow) => (
        <Space size={[4, 4]} wrap>
          {record.permissions.map(permission => (
            <Tag key={permission}>{nameOf(permission)}</Tag>
          ))}
        </Space>
      ),
    },
    {
      key: 'action',
      width: 96,
      render: (_text: unknown, record: UserRow) => (
        <div className="list-actions-column">
          <Tooltip title="Edit permissions">
            <EditOutlined
              className="list-actions-icon"
              onClick={() => openModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Remove this user from the workspace?"
            onConfirm={() => handleRemove(record.userId)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Remove">
              <DeleteOutlined className="list-actions-icon" />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const getTableHeader = () => (
    <div className="list-table-header">
      <Space size={12}>
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={() => openModal(null)}
        >
          Add User
        </Button>
      </Space>
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
          rowKey="_id"
          dataSource={users}
          columns={columns}
          title={getTableHeader}
          loading={loading && !data}
          bordered
          size="middle"
          tableLayout="fixed"
          pagination={false}
          locale={{ emptyText: 'No users added yet' }}
        />
      </div>

      <Modal
        title={modal?.editing ? 'Edit Permissions' : 'Add User'}
        open={modal != null}
        okText="Save"
        confirmLoading={saving}
        onOk={handleOk}
        onCancel={() => setModal(null)}
        destroyOnHidden
      >
        {/* The global form width (600px) is wider than the modal. */}
        <Form form={form} layout="vertical" style={{ width: '100%' }}>
          {modal?.editing ? (
            <Form.Item label="User">
              {modal.editing.displayName ?? modal.editing.username}
            </Form.Item>
          ) : (
            <Form.Item
              name="userId"
              label="User"
              extra="Only users linked to a person can use workspaces."
              rules={[{ required: true, message: 'Please select a user.' }]}
            >
              <Select
                showSearch
                placeholder="Search by name or username"
                filterOption={false}
                onSearch={setSearch}
                loading={searching}
                options={candidates}
                notFoundContent="No users found"
              />
            </Form.Item>
          )}
          <Form.Item
            name="permissions"
            label="Permissions"
            rules={[
              { required: true, message: 'Please select at least one permission.' },
            ]}
          >
            <Checkbox.Group style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {permissionInfos.map(info => (
                <Checkbox
                  key={info!.key}
                  value={info!.key}
                  disabled={info!.key === DutiesAttendancePermissions.VIEW}
                >
                  <strong>{info!.name}</strong>
                  <div style={{ color: '#667085' }}>{info!.description}</div>
                </Checkbox>
              ))}
            </Checkbox.Group>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default LocationDutiesAttendanceUsers;
