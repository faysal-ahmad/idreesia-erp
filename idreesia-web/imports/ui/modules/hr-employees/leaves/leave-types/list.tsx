import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  DeleteOutlined,
  PlusCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Space,
  Spin,
  Switch,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import { message } from '/imports/ui/antd-feedback';

import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import type { AllLeaveTypesQuery } from 'meteor/idreesia-common/types/client-operations';
import useListScrollY from '/imports/ui/modules/security/security-server/common/use-list-scroll-y';

import {
  ALL_LEAVE_TYPES,
  CREATE_LEAVE_TYPE,
  REMOVE_LEAVE_TYPE,
  UPDATE_LEAVE_TYPE,
} from '../gql';

type LeaveTypeRow = NonNullable<
  NonNullable<AllLeaveTypesQuery['allLeaveTypes']>[number]
> & { _id: string };

interface FormValues {
  name: string;
  annualEntitlementDays: number;
  isPaid: boolean;
  allowCarryForward: boolean;
  maxCarryForwardDays?: number | null;
  isActive: boolean;
}

const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

/** Setup → Leave Types: the organisation's leave types and day counts. */
const LeaveTypesList = () => {
  useBreadcrumbs(['HR - Employees', 'Setup', 'Leave Types']);
  const { containerRef, scrollY } = useListScrollY();
  const [form] = Form.useForm<FormValues>();
  const [editing, setEditing] = useState<LeaveTypeRow | null>(null);
  const [open, setOpen] = useState(false);
  const { data, loading, refetch } = useQuery(ALL_LEAVE_TYPES);
  const options = { refetchQueries: ['allLeaveTypes'] };
  const [createLeaveType, { loading: creating }] = useMutation(
    CREATE_LEAVE_TYPE,
    options
  );
  const [updateLeaveType, { loading: updating }] = useMutation(
    UPDATE_LEAVE_TYPE,
    options
  );
  const [removeLeaveType] = useMutation(REMOVE_LEAVE_TYPE, options);
  const allowCarryForward = Form.useWatch('allowCarryForward', form);

  const leaveTypes = (data?.allLeaveTypes ?? []).filter(
    (row): row is LeaveTypeRow => !!row?._id
  );

  const handleNew = () => {
    setEditing(null);
    form.setFieldsValue({
      name: '',
      annualEntitlementDays: 0,
      isPaid: true,
      allowCarryForward: false,
      maxCarryForwardDays: null,
      isActive: true,
    });
    setOpen(true);
  };

  const handleEdit = (record: LeaveTypeRow) => {
    setEditing(record);
    form.setFieldsValue({
      name: record.name ?? '',
      annualEntitlementDays: record.annualEntitlementDays ?? 0,
      isPaid: !!record.isPaid,
      allowCarryForward: !!record.allowCarryForward,
      maxCarryForwardDays: record.maxCarryForwardDays ?? null,
      isActive: !!record.isActive,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    let values: FormValues;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    const variables = {
      ...values,
      maxCarryForwardDays: values.allowCarryForward
        ? (values.maxCarryForwardDays ?? null)
        : null,
    };
    try {
      if (editing) {
        await updateLeaveType({ variables: { _id: editing._id, ...variables } });
        message.success('Leave type updated', 2);
      } else {
        await createLeaveType({ variables });
        message.success('Leave type created', 2);
      }
      setOpen(false);
    } catch (error) {
      message.error((error as Error).message, 5);
    }
  };

  const handleRemove = (record: LeaveTypeRow) => {
    removeLeaveType({ variables: { _id: record._id } })
      .then(() => message.success('Leave type deleted', 2))
      .catch((error: Error) => message.error(error.message, 5));
  };

  const handleRefresh = () => {
    refetch().then(() => message.success('Data Reloaded', 2));
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: LeaveTypeRow) => (
        <Button
          type="link"
          style={{ padding: 0, height: 'auto' }}
          onClick={() => handleEdit(record)}
        >
          {text}
        </Button>
      ),
    },
    {
      title: 'Days / Year',
      dataIndex: 'annualEntitlementDays',
      key: 'annualEntitlementDays',
      width: 120,
    },
    {
      title: 'Paid',
      key: 'isPaid',
      width: 90,
      render: (_t: unknown, record: LeaveTypeRow) =>
        record.isPaid ? 'Yes' : 'No',
    },
    {
      title: 'Carry Forward',
      key: 'carry',
      width: 160,
      render: (_t: unknown, record: LeaveTypeRow) => {
        if (!record.allowCarryForward) return 'No';
        return record.maxCarryForwardDays != null
          ? `Up to ${record.maxCarryForwardDays} days`
          : 'Yes, no limit';
      },
    },
    {
      title: 'Status',
      key: 'isActive',
      width: 110,
      render: (_t: unknown, record: LeaveTypeRow) =>
        record.isActive ? (
          <Tag color="green">Active</Tag>
        ) : (
          <Tag>Inactive</Tag>
        ),
    },
    {
      key: 'action',
      width: 60,
      render: (_t: unknown, record: LeaveTypeRow) =>
        record.usedCount ? null : (
          <div className="list-actions-column">
            <Popconfirm
              title="Are you sure you want to delete this leave type?"
              onConfirm={() => handleRemove(record)}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Delete">
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
          icon={<PlusCircleOutlined />}
          onClick={handleNew}
        >
          New Leave Type
        </Button>
      </Space>
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
    <>
      <div className="list-container" ref={containerRef}>
        <Table
          className="list-table"
          rowKey="_id"
          dataSource={leaveTypes}
          columns={columns}
          title={getTableHeader}
          bordered
          size="middle"
          tableLayout="fixed"
          pagination={false}
          scroll={{ y: scrollY }}
          footer={() => `${leaveTypes.length} leave types`}
        />
      </div>
      <Modal
        title={editing ? 'Edit Leave Type' : 'New Leave Type'}
        open={open}
        width={560}
        okText="Save"
        confirmLoading={creating || updating}
        onOk={handleSave}
        onCancel={() => setOpen(false)}
        forceRender
      >
        <Form form={form} layout="horizontal" style={{ width: '100%' }}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter a name.' }]}
            {...formItemLayout}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="annualEntitlementDays"
            label="Days per Year"
            rules={[{ required: true, message: 'Please enter the days.' }]}
            {...formItemLayout}
          >
            <InputNumber min={0} max={366} step={0.5} style={{ width: 140 }} />
          </Form.Item>
          <Form.Item
            name="isPaid"
            label="Paid"
            valuePropName="checked"
            extra="Only paid types warn when a request goes over the balance."
            {...formItemLayout}
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="allowCarryForward"
            label="Carry Forward"
            valuePropName="checked"
            extra="Unused days move into the next year."
            {...formItemLayout}
          >
            <Switch />
          </Form.Item>
          {allowCarryForward ? (
            <Form.Item
              name="maxCarryForwardDays"
              label="Carry Forward Limit"
              extra="Leave empty for no limit."
              {...formItemLayout}
            >
              <InputNumber min={0} step={0.5} style={{ width: 140 }} />
            </Form.Item>
          ) : null}
          <Form.Item
            name="isActive"
            label="Active"
            valuePropName="checked"
            {...formItemLayout}
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default LeaveTypesList;
