import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation } from '@apollo/client/react';
import {
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import {
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import { message } from '/imports/ui/antd-feedback';

import DutyMembersPanel from './duty-members-panel';
import {
  WORKSPACE_DA_CREATE_DUTY,
  WORKSPACE_DA_REMOVE_DUTY,
  WORKSPACE_DA_UPDATE_DUTY,
} from './gql';
import {
  useDuties,
  useDutiesAttendanceAccess,
  type Duty,
} from './hooks';

interface DutyFormValues {
  name: string;
  description?: string;
  isActive?: boolean;
}

// The duties of a location's workspace, with their rosters.
const DutiesPage = () => {
  const { locationId } = useParams<{ locationId: string }>();
  const [form] = Form.useForm<DutyFormValues>();
  const { duties, loading, refetch } = useDuties(locationId);
  const { canManageDuties } = useDutiesAttendanceAccess(locationId);
  const [editing, setEditing] = useState<Duty | 'new' | null>(null);
  const [saving, setSaving] = useState(false);

  const [createDuty] = useMutation(WORKSPACE_DA_CREATE_DUTY);
  const [updateDuty] = useMutation(WORKSPACE_DA_UPDATE_DUTY);
  const [removeDuty] = useMutation(WORKSPACE_DA_REMOVE_DUTY);

  const openForm = (duty: Duty | 'new') => {
    form.resetFields();
    form.setFieldsValue(
      duty === 'new'
        ? { name: '', description: '', isActive: true }
        : {
            name: duty.name ?? '',
            description: duty.description ?? '',
            isActive: duty.isActive ?? true,
          }
    );
    setEditing(duty);
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      if (editing === 'new') {
        await createDuty({
          variables: {
            locationId,
            name: values.name,
            description: values.description || undefined,
          },
        });
        message.success('Duty created', 2);
      } else if (editing) {
        await updateDuty({
          variables: {
            locationId,
            dutyId: editing._id as string,
            name: values.name,
            // An empty description clears it.
            description: values.description ?? '',
            isActive: values.isActive,
          },
        });
        message.success('Duty saved', 2);
      }
      setEditing(null);
      await refetch();
    } catch (error) {
      message.error((error as Error).message, 5);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = (dutyId: string) => {
    removeDuty({ variables: { locationId, dutyId } })
      .then(() => {
        message.success('Duty deleted', 2);
        return refetch();
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const columns: any[] = [
    {
      title: 'Duty',
      key: 'name',
      render: (_text: unknown, duty: Duty) => (
        <>
          <div className="da-duty-name">{duty.name}</div>
          {duty.description ? (
            <div className="da-muted">{duty.description}</div>
          ) : null}
        </>
      ),
    },
    {
      title: 'Members',
      key: 'members',
      width: 120,
      render: (_text: unknown, duty: Duty) => (duty.members ?? []).length,
    },
    {
      title: 'Status',
      key: 'status',
      width: 120,
      render: (_text: unknown, duty: Duty) =>
        duty.isActive ? (
          <Tag color="green">Active</Tag>
        ) : (
          <Tag>Inactive</Tag>
        ),
    },
    {
      key: 'action',
      width: 100,
      render: (_text: unknown, duty: Duty) => (
        <div className="list-actions-column">
          {canManageDuties ? (
            <>
              <Tooltip title="Edit">
                <EditOutlined
                  className="list-actions-icon"
                  onClick={() => openForm(duty)}
                />
              </Tooltip>
              <Popconfirm
                title="Delete this duty?"
                description="A duty that has had people on duty can't be deleted; make it inactive instead."
                onConfirm={() => handleRemove(duty._id)}
                okText="Yes"
                cancelText="No"
              >
                <Tooltip title="Delete">
                  <DeleteOutlined className="list-actions-icon" />
                </Tooltip>
              </Popconfirm>
            </>
          ) : null}
        </div>
      ),
    },
  ];

  const getTableHeader = () => (
    <div className="list-table-header">
      <Space size={12}>
        {canManageDuties ? (
          <Button
            type="primary"
            icon={<PlusCircleOutlined />}
            onClick={() => openForm('new')}
          >
            New Duty
          </Button>
        ) : null}
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
          dataSource={duties}
          columns={columns}
          title={getTableHeader}
          loading={loading}
          bordered
          size="middle"
          tableLayout="fixed"
          pagination={false}
          expandable={{
            expandedRowRender: (duty: Duty) => (
              <DutyMembersPanel
                locationId={locationId}
                duty={duty}
                canManage={canManageDuties}
                onChanged={() => refetch()}
              />
            ),
          }}
          locale={{ emptyText: 'No duties yet' }}
        />
      </div>

      <Modal
        title={editing === 'new' ? 'New Duty' : 'Edit Duty'}
        open={editing != null}
        okText="Save"
        confirmLoading={saving}
        onOk={handleOk}
        onCancel={() => setEditing(null)}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" style={{ width: '100%' }}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter the duty name.' }]}
          >
            <Input maxLength={255} />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} maxLength={2000} />
          </Form.Item>
          {editing && editing !== 'new' ? (
            <Form.Item
              name="isActive"
              label="Active"
              valuePropName="checked"
              extra="An inactive duty is no longer planned. When it is made active again, it picks up from tomorrow."
            >
              <Switch />
            </Form.Item>
          ) : null}
        </Form>
      </Modal>
    </>
  );
};

export default DutiesPage;
