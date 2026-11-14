import React, { useEffect, useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { DatePicker, Form, Input, Modal, Select } from 'antd';

import { Formats } from 'meteor/idreesia-common/constants';

import { PRIORITY_LABELS } from './format';
import type {
  ProjectMember,
  Task,
  TaskDetails,
  TaskPriority,
} from './types';

interface FormValues {
  title: string;
  description?: string;
  assigneeId?: string | null;
  dueDate?: Dayjs | null;
  priority: TaskPriority;
  tags?: string[];
}

interface Props {
  open: boolean;
  /** The task being edited; unset to create one. */
  task?: Task | null;
  members: ProjectMember[];
  /** Create only: the project the new task belongs to. */
  projectId?: string | null;
  onCancel: () => void;
  onSubmit: (details: TaskDetails) => Promise<void>;
}

/** Create or edit a task: title, assignee (one person), due date, priority. */
const TaskFormModal = ({
  open,
  task,
  members,
  projectId,
  onCancel,
  onSubmit,
}: Props) => {
  const [form] = Form.useForm<FormValues>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    form.setFieldsValue(
      task
        ? {
            title: task.title,
            description: task.description ?? undefined,
            assigneeId: task.assigneeId,
            dueDate: task.dueDate ? dayjs(Number(task.dueDate)) : null,
            priority: task.priority,
            tags: task.tags,
          }
        : { priority: 'normal', tags: [] }
    );
  }, [open, task, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      await onSubmit({
        title: values.title,
        description: values.description?.trim() || null,
        assigneeId: values.assigneeId || null,
        dueDate: values.dueDate
          ? String(values.dueDate.startOf('day').valueOf())
          : null,
        priority: values.priority,
        tags: values.tags ?? [],
        ...(task ? {} : { projectId: projectId ?? null }),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={task ? 'Edit Task' : 'New Task'}
      okText="Save"
      confirmLoading={saving}
      onOk={handleOk}
      onCancel={onCancel}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" style={{ width: '100%' }}>
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, whitespace: true, message: 'Enter a title' }]}
        >
          <Input maxLength={255} autoFocus />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} maxLength={10000} />
        </Form.Item>
        <Form.Item name="assigneeId" label="Assigned To">
          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder="Unassigned"
            options={members.map(member => ({
              value: member.personId,
              label: member.name ?? member.personId,
            }))}
          />
        </Form.Item>
        <Form.Item name="dueDate" label="Due Date">
          <DatePicker format={Formats.DATE_FORMAT} style={{ width: 200 }} />
        </Form.Item>
        <Form.Item name="priority" label="Priority">
          <Select
            style={{ width: 200 }}
            options={Object.entries(PRIORITY_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
          />
        </Form.Item>
        <Form.Item name="tags" label="Tags">
          <Select mode="tags" tokenSeparators={[',']} open={false} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TaskFormModal;
