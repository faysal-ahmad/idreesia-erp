import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
  SyncOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { Button, Drawer, Form, Input, Modal, Space, Table, Tag, Tooltip } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import type { KarkunSelectionItem } from '/imports/ui/modules/helpers/controls';

import {
  ADD_HR_GROUP_MEMBER,
  CREATE_HR_USER_GROUP,
  DELETE_HR_USER_GROUP,
  HR_USER_GROUPS,
  REMOVE_HR_GROUP_MEMBER,
  UPDATE_HR_USER_GROUP,
} from './gql';
import KarkunPicker from './karkun-picker';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const REFETCH = ['hrUserGroups'];

interface MemberEntry {
  userId: string;
  personId?: string | null;
  label: string;
}

interface GroupRow {
  _id: string;
  name: string;
  description: string;
  users: MemberEntry[];
}

interface GroupFormValues {
  name: string;
  description?: string;
}

const userLabel = (user: { username?: string | null; displayName?: string | null; userId?: string | null }) =>
  user.displayName ? `${user.displayName} (${user.username ?? ''})` : (user.username ?? user.userId ?? '');

const reportError = (error: Error) => message.error(error.message, 5);

/** HR's user groups and who belongs to each. */
const UserGroupsTab = () => {
  const [form] = Form.useForm<GroupFormValues>();
  // `null` closed, `'new'` creating, otherwise the group being edited.
  const [editing, setEditing] = useState<GroupRow | 'new' | null>(null);
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState<GroupRow | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);

  const { data, loading, refetch } = useQuery(HR_USER_GROUPS, {
    fetchPolicy: 'cache-and-network',
  });
  const [createGroup] = useMutation(CREATE_HR_USER_GROUP, { refetchQueries: REFETCH });
  const [updateGroup] = useMutation(UPDATE_HR_USER_GROUP, { refetchQueries: REFETCH });
  const [deleteGroup] = useMutation(DELETE_HR_USER_GROUP, { refetchQueries: REFETCH });
  const [addMember] = useMutation(ADD_HR_GROUP_MEMBER, { refetchQueries: REFETCH });
  const [removeMember] = useMutation(REMOVE_HR_GROUP_MEMBER, { refetchQueries: REFETCH });

  const rows: GroupRow[] = (data?.hrUserGroups ?? []).flatMap((group) =>
    group?._id
      ? [
          {
            _id: group._id,
            name: group.name,
            description: group.description ?? '',
            users: (group.users ?? []).flatMap((user) =>
              user?.userId
                ? [{ userId: user.userId, personId: user.personId, label: userLabel(user) }]
                : []
            ),
          },
        ]
      : []
  );

  // The group being added to, as of the latest data.
  const addingRow = rows.find((row) => row._id === adding?._id) ?? adding;

  const openForm = (group: GroupRow | 'new') => {
    form.setFieldsValue(
      group === 'new' ? { name: '', description: '' } : { name: group.name, description: group.description }
    );
    setEditing(group);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      if (editing === 'new') {
        await createGroup({ variables: { name: values.name, description: values.description } });
        message.success('Group created.', 3);
      } else if (editing) {
        await updateGroup({
          variables: { _id: editing._id, name: values.name, description: values.description },
        });
        message.success('Group updated.', 3);
      }
      setEditing(null);
    } catch (error) {
      reportError(error as Error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddMember = (karkun: KarkunSelectionItem) => {
    if (!addingRow) return;
    setAddingId(karkun._id);
    addMember({ variables: { groupId: addingRow._id, karkunId: karkun._id } })
      .then(() => message.success(`${karkun.name} added to "${addingRow.name}".`, 3))
      .catch(reportError)
      .finally(() => setAddingId(null));
  };

  const confirmRemoveMember = (group: GroupRow, user: MemberEntry) => {
    Modal.confirm({
      title: `Remove ${user.label} from "${group.name}"?`,
      okText: 'Yes',
      cancelText: 'No',
      onOk: () =>
        removeMember({ variables: { groupId: group._id, userId: user.userId } }).catch(reportError),
    });
  };

  const confirmDelete = (group: GroupRow) => {
    Modal.confirm({
      title: `Delete the group "${group.name}"?`,
      content: group.users.length ? 'Remove its users first; a group with users cannot be deleted.' : undefined,
      okText: 'Yes',
      cancelText: 'No',
      onOk: () => deleteGroup({ variables: { _id: group._id } }).catch(reportError),
    });
  };

  const columns: any[] = [
    {
      title: 'User Group',
      key: 'name',
      width: '30%',
      render: (_text: unknown, record: GroupRow) => (
        <Tooltip title={record.description}>
          <strong>{record.name}</strong>
        </Tooltip>
      ),
    },
    {
      title: 'Users',
      key: 'users',
      render: (_text: unknown, record: GroupRow) => (
        <Space size={[4, 4]} wrap>
          {record.users.map((user) => (
            <Tag
              key={user.userId}
              closable
              onClose={(event) => {
                event.preventDefault();
                confirmRemoveMember(record, user);
              }}
            >
              {user.label}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      key: 'action',
      width: 130,
      render: (_text: unknown, record: GroupRow) => (
        <div className="list-actions-column">
          <Tooltip title="Add user">
            <UserAddOutlined className="list-actions-icon" onClick={() => setAdding(record)} />
          </Tooltip>
          <Tooltip title="Edit group">
            <EditOutlined className="list-actions-icon" onClick={() => openForm(record)} />
          </Tooltip>
          <Tooltip title="Delete group">
            <DeleteOutlined className="list-actions-icon" onClick={() => confirmDelete(record)} />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="list-container">
        <Table
          className="list-table"
          rowKey="_id"
          dataSource={rows}
          columns={columns}
          title={() => (
            <div className="list-table-header">
              <Space size={12}>
                <Button type="primary" icon={<PlusCircleOutlined />} onClick={() => openForm('new')}>
                  New Group
                </Button>
              </Space>
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
          locale={{ emptyText: 'No user groups yet' }}
        />
      </div>

      <Modal
        title={editing === 'new' ? 'New User Group' : 'Edit User Group'}
        open={editing != null}
        okText="Save"
        confirmLoading={saving}
        onOk={handleSave}
        onCancel={() => setEditing(null)}
        width={560}
        destroyOnHidden
        forceRender
      >
        <Form
          form={form}
          layout="horizontal"
          style={{ width: '100%', maxWidth: '100%' }}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Enter a name for the group.' }]}
            {...formItemLayout}
          >
            <Input maxLength={255} />
          </Form.Item>
          <Form.Item name="description" label="Description" {...formItemLayout}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title={addingRow ? `Add User to "${addingRow.name}"` : 'Add User'}
        width={900}
        open={adding != null}
        onClose={() => setAdding(null)}
        destroyOnHidden
      >
        <KarkunPicker
          selectedIds={(addingRow?.users ?? []).flatMap((user) => (user.personId ? [user.personId] : []))}
          selectedLabel="Member"
          addingId={addingId}
          onAdd={handleAddMember}
        />
      </Drawer>
    </>
  );
};

export default UserGroupsTab;
