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
  WORKSPACE_DA_ADD_DUTIES,
  WORKSPACE_DA_REMOVE_DUTY,
  WORKSPACE_DA_UPDATE_DUTY,
} from './gql';
import {
  useDuties,
  useDutiesAttendanceAccess,
  useMehfilDuties,
  type Duty,
} from './hooks';

interface DutyFormValues {
  name?: string;
  isActive?: boolean;
}

// The duties of a location's workspace, with their rosters.
const DutiesPage = () => {
  const { locationId } = useParams<{ locationId: string }>();
  const [form] = Form.useForm<DutyFormValues>();
  const { duties, loading, refetch } = useDuties(locationId);
  const { canManageDuties } = useDutiesAttendanceAccess(locationId);
  const [editing, setEditing] = useState<Duty | null>(null);
  const [adding, setAdding] = useState(false);
  const [selectedDutyIds, setSelectedDutyIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const { mehfilDuties, loading: loadingMehfilDuties } = useMehfilDuties(
    locationId,
    !adding
  );
  // A duty the location already has can't be chosen again.
  const usedMehfilDutyIds = new Set(duties.map(duty => duty.mehfilDutyId));
  const availableMehfilDuties = mehfilDuties.filter(
    duty => !usedMehfilDutyIds.has(duty._id)
  );

  const [addDuties] = useMutation(WORKSPACE_DA_ADD_DUTIES);
  const [updateDuty] = useMutation(WORKSPACE_DA_UPDATE_DUTY);
  const [removeDuty] = useMutation(WORKSPACE_DA_REMOVE_DUTY);

  const openForm = (duty: Duty) => {
    form.resetFields();
    form.setFieldsValue({
      name: duty.name ?? '',
      isActive: duty.isActive ?? true,
    });
    setEditing(duty);
  };

  const openAddModal = () => {
    setSelectedDutyIds([]);
    setAdding(true);
  };

  const handleAddOk = async () => {
    setSaving(true);
    try {
      await addDuties({
        variables: { locationId, mehfilDutyIds: selectedDutyIds },
      });
      message.success(
        selectedDutyIds.length === 1
          ? 'Duty added'
          : `${selectedDutyIds.length} duties added`,
        2
      );
      setAdding(false);
      await refetch();
    } catch (error) {
      message.error((error as Error).message, 5);
    } finally {
      setSaving(false);
    }
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      if (editing) {
        await updateDuty({
          variables: {
            locationId,
            dutyId: editing._id as string,
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
            onClick={openAddModal}
          >
            Add Duty
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
        title="Add Duty"
        open={adding}
        okText="Add"
        okButtonProps={{ disabled: selectedDutyIds.length === 0 }}
        confirmLoading={saving}
        onOk={handleAddOk}
        onCancel={() => setAdding(false)}
        width={640}
        destroyOnHidden
      >
        <p className="da-muted">
          Duties are defined by the administrators. Select the ones this
          location uses.
        </p>
        <Table
          rowKey="_id"
          size="small"
          bordered
          pagination={false}
          loading={loadingMehfilDuties}
          dataSource={availableMehfilDuties}
          scroll={{ y: 360 }}
          rowSelection={{
            selectedRowKeys: selectedDutyIds,
            onChange: keys => setSelectedDutyIds(keys as string[]),
          }}
          columns={[
            { title: 'Duty', dataIndex: 'name', key: 'name', width: 220 },
            {
              title: 'Description',
              dataIndex: 'description',
              key: 'description',
              render: (text?: string | null) => text ?? '',
            },
          ]}
          locale={{ emptyText: 'No more duties to add' }}
        />
      </Modal>

      <Modal
        title="Edit Duty"
        open={editing != null}
        okText="Save"
        confirmLoading={saving}
        onOk={handleOk}
        onCancel={() => setEditing(null)}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" style={{ width: '100%' }}>
          <Form.Item name="name" label="Duty">
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="isActive"
            label="Active"
            valuePropName="checked"
            extra="An inactive duty is no longer planned. When it is made active again, it picks up from today."
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default DutiesPage;
