import React, { useState } from 'react';
import dayjs from 'dayjs';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Modal, Popconfirm, Table, Tooltip } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import type {
  CreateJobShiftMutation,
  CreateJobShiftMutationVariables,
  RemoveJobShiftMutation,
  RemoveJobShiftMutationVariables,
  UpdateJobShiftMutation,
  UpdateJobShiftMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';
import {
  ShiftForm,
  formatShiftDuration,
  formatShiftTime,
  type ShiftFormValues,
} from '/imports/ui/modules/helpers/shifts';

const CREATE_JOB_SHIFT: TypedDocumentNode<
  CreateJobShiftMutation,
  CreateJobShiftMutationVariables
> = gql`
  mutation createJobShift(
    $jobId: String!
    $name: String!
    $startTime: String
    $endTime: String
  ) {
    createJobShift(
      jobId: $jobId
      name: $name
      startTime: $startTime
      endTime: $endTime
    ) {
      _id
    }
  }
`;

const UPDATE_JOB_SHIFT: TypedDocumentNode<
  UpdateJobShiftMutation,
  UpdateJobShiftMutationVariables
> = gql`
  mutation updateJobShift(
    $_id: String!
    $name: String!
    $startTime: String
    $endTime: String
  ) {
    updateJobShift(
      _id: $_id
      name: $name
      startTime: $startTime
      endTime: $endTime
    ) {
      _id
    }
  }
`;

const REMOVE_JOB_SHIFT: TypedDocumentNode<
  RemoveJobShiftMutation,
  RemoveJobShiftMutationVariables
> = gql`
  mutation removeJobShift($_id: String!) {
    removeJobShift(_id: $_id)
  }
`;

export interface JobShiftRow {
  _id: string;
  name?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  usedCount?: number | null;
}

const toTimeVariable = (value: unknown): string | null => {
  if (value == null || value === '') return null;
  if (dayjs.isDayjs(value)) return value.toISOString();
  if (value instanceof Date) return value.toISOString();
  return String(value);
};

interface Props {
  jobId: string;
  shifts: JobShiftRow[];
}

/** The shifts of a job, with add, edit and delete. A job may have none. */
const ShiftsSection = ({ jobId, shifts }: Props) => {
  const [form] = Form.useForm<ShiftFormValues>();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<JobShiftRow | null>(null);

  const mutationOptions = { refetchQueries: ['jobById', 'allJobs'] };
  const [createJobShift] = useMutation(CREATE_JOB_SHIFT, mutationOptions);
  const [updateJobShift] = useMutation(UPDATE_JOB_SHIFT, mutationOptions);
  const [removeJobShift] = useMutation(REMOVE_JOB_SHIFT, mutationOptions);

  const handleAdd = () => {
    setEditing(null);
    form.resetFields();
    setOpen(true);
  };

  const handleEdit = (shift: JobShiftRow) => {
    setEditing(shift);
    form.setFieldsValue({
      name: shift.name ?? '',
      startTime: shift.startTime ? dayjs(shift.startTime) : null,
      endTime: shift.endTime ? dayjs(shift.endTime) : null,
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
    form.resetFields();
  };

  const handleSave = async () => {
    let values: ShiftFormValues;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    const variables = {
      name: values.name,
      startTime: toTimeVariable(values.startTime),
      endTime: toTimeVariable(values.endTime),
    };
    setSaving(true);
    try {
      if (editing) {
        await updateJobShift({ variables: { _id: editing._id, ...variables } });
        message.success('Shift updated', 2);
      } else {
        await createJobShift({ variables: { jobId, ...variables } });
        message.success('Shift added', 2);
      }
      handleClose();
    } catch (error) {
      message.error((error as Error).message, 5);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = (shiftId: string) => {
    removeJobShift({ variables: { _id: shiftId } })
      .then(() => message.success('Shift deleted', 2))
      .catch((error: Error) => message.error(error.message, 5));
  };

  const columns = [
    {
      title: 'Shift Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: JobShiftRow) => (
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
      title: 'Start Time',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 120,
      render: (value: string | null | undefined) => formatShiftTime(value),
    },
    {
      title: 'End Time',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 120,
      render: (value: string | null | undefined) => formatShiftTime(value),
    },
    {
      title: 'Duration',
      key: 'duration',
      width: 100,
      render: (_text: unknown, record: JobShiftRow) =>
        formatShiftDuration(record.startTime, record.endTime),
    },
    {
      title: 'Employees',
      dataIndex: 'usedCount',
      key: 'usedCount',
      width: 100,
    },
    {
      key: 'action',
      width: 60,
      render: (_text: unknown, record: JobShiftRow) =>
        record.usedCount ? null : (
          <div className="list-actions-column">
            <Popconfirm
              title="Are you sure you want to delete this shift?"
              onConfirm={() => handleRemove(record._id)}
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

  return (
    <>
      <div className="list-table-header" style={{ marginBottom: 8 }}>
        <span style={{ color: '#667085' }}>
          Optional. Employees with this job can be given one of its shifts.
        </span>
        <Button size="small" icon={<PlusOutlined />} onClick={handleAdd}>
          Add Shift
        </Button>
      </div>
      <Table
        rowKey="_id"
        className="list-table"
        dataSource={shifts}
        columns={columns}
        size="middle"
        bordered
        tableLayout="fixed"
        pagination={false}
        locale={{ emptyText: 'No shifts' }}
      />
      <Modal
        title={editing ? 'Edit Shift' : 'Add Shift'}
        open={open}
        onOk={handleSave}
        onCancel={handleClose}
        confirmLoading={saving}
        okText="Save"
        forceRender
      >
        <ShiftForm form={form} />
      </Modal>
    </>
  );
};

export default ShiftsSection;
