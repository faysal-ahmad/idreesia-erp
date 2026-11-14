import React, { useEffect, useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { DatePicker, Form, Input, Modal, Select, Space } from 'antd';

import { Formats } from 'meteor/idreesia-common/constants';

import type { Project, ProjectDetails, ProjectMember } from './types';

interface FormValues {
  title: string;
  objective?: string;
  description?: string;
  participantIds?: string[];
  startDate?: Dayjs | null;
  targetDate?: Dayjs | null;
  tags?: string[];
}

interface Props {
  open: boolean;
  /** The project being edited; unset to create one. */
  project?: Project | null;
  members: ProjectMember[];
  onCancel: () => void;
  onSubmit: (details: ProjectDetails) => Promise<void>;
}

const toTimestamp = (value?: Dayjs | null) =>
  value ? String(value.startOf('day').valueOf()) : null;

/**
 * Create or edit a project. Participants are chosen on create; afterwards
 * they are managed on the project's Participants tab.
 */
const ProjectFormModal = ({
  open,
  project,
  members,
  onCancel,
  onSubmit,
}: Props) => {
  const [form] = Form.useForm<FormValues>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    form.setFieldsValue(
      project
        ? {
            title: project.title,
            objective: project.objective ?? undefined,
            description: project.description ?? undefined,
            startDate: project.startDate ? dayjs(Number(project.startDate)) : null,
            targetDate: project.targetDate
              ? dayjs(Number(project.targetDate))
              : null,
            tags: project.tags,
          }
        : { participantIds: [], tags: [] }
    );
  }, [open, project, form]);

  const options = members.map(member => ({
    value: member.personId,
    label: member.name ?? member.personId,
  }));

  const handleOk = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      await onSubmit({
        title: values.title,
        objective: values.objective?.trim() || null,
        description: values.description?.trim() || null,
        ...(project ? {} : { participantIds: values.participantIds ?? [] }),
        startDate: toTimestamp(values.startDate),
        targetDate: toTimestamp(values.targetDate),
        tags: values.tags ?? [],
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={project ? 'Edit Project' : 'New Project'}
      okText="Save"
      confirmLoading={saving}
      onOk={handleOk}
      onCancel={onCancel}
      destroyOnHidden
      width={640}
    >
      <Form form={form} layout="vertical" style={{ width: '100%' }}>
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, whitespace: true, message: 'Enter a title' }]}
        >
          <Input maxLength={255} autoFocus />
        </Form.Item>
        <Form.Item name="objective" label="Objective">
          <Input.TextArea
            rows={2}
            maxLength={10000}
            placeholder="What the project is meant to achieve"
          />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} maxLength={10000} />
        </Form.Item>
        {project ? null : (
          <Form.Item
            name="participantIds"
            label="Participants"
            extra="Participants can use the project chat."
          >
            <Select
              mode="multiple"
              allowClear
              showSearch
              optionFilterProp="label"
              options={options}
            />
          </Form.Item>
        )}
        <Space size={24} align="start" wrap>
          <Form.Item name="startDate" label="Start Date">
            <DatePicker format={Formats.DATE_FORMAT} style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="targetDate" label="Target Date">
            <DatePicker format={Formats.DATE_FORMAT} style={{ width: 200 }} />
          </Form.Item>
        </Space>
        <Form.Item name="tags" label="Tags">
          <Select mode="tags" tokenSeparators={[',']} open={false} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProjectFormModal;
