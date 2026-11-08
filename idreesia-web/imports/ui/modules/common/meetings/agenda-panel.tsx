import React, { useEffect, useState } from 'react';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Typography,
} from 'antd';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';

import { message } from '/imports/ui/antd-feedback';

import type { AgendaItemInput, Meeting, MeetingAgendaItem } from './types';
import type { PanelProps } from './panel-props';

const showError = (error: unknown) =>
  message.error(error instanceof Error ? error.message : String(error));

interface ItemFormValues {
  title: string;
  description?: string;
  durationMinutes?: number | null;
  presenterId?: string | null;
}

/** The meeting's agenda, in order. Managers add, edit, reorder and remove. */
const AgendaPanel = ({
  provider,
  meeting,
  info,
  members,
  onMeetingChange,
}: PanelProps) => {
  const canEdit = info.canManage && meeting.status !== 'cancelled';
  const [form] = Form.useForm<ItemFormValues>();
  const [editing, setEditing] = useState<MeetingAgendaItem | 'new' | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) return;
    form.resetFields();
    if (editing !== 'new') {
      form.setFieldsValue({
        title: editing.title,
        description: editing.description ?? undefined,
        durationMinutes: editing.durationMinutes,
        presenterId: editing.presenterId,
      });
    }
  }, [editing, form]);

  const change = async (action: () => Promise<Meeting>, success: string) => {
    try {
      onMeetingChange(await action());
      message.success(success, 2);
      return true;
    } catch (error) {
      showError(error);
      return false;
    }
  };

  const move = (index: number, by: number) => {
    const ids = meeting.agenda.map(item => item._id);
    const [id] = ids.splice(index, 1);
    ids.splice(index + by, 0, id);
    change(() => provider.reorderAgenda(meeting._id, ids), 'Agenda reordered');
  };

  const totalMinutes = meeting.agenda.reduce(
    (sum, item) => sum + (item.durationMinutes ?? 0),
    0
  );

  // Presenters: the participants first, then any other member.
  const participantIds = new Set(meeting.participants.map(p => p.participantId));
  const presenterOptions = [...members]
    .sort(
      (a, b) =>
        Number(participantIds.has(b.participantId)) -
        Number(participantIds.has(a.participantId))
    )
    .map(member => ({
      value: member.participantId,
      label: member.name ?? member.participantId,
    }));

  const columns = [
    {
      title: '#',
      key: 'index',
      width: 56,
      render: (_: unknown, __: MeetingAgendaItem, index: number) => index + 1,
    },
    {
      title: 'Item',
      key: 'title',
      render: (_: unknown, item: MeetingAgendaItem) => (
        <div>
          <div>{item.title}</div>
          {item.description ? (
            <Typography.Text type="secondary" className="meeting-pre-wrap">
              {item.description}
            </Typography.Text>
          ) : null}
        </div>
      ),
    },
    {
      title: 'Presenter',
      key: 'presenter',
      width: 200,
      ellipsis: true,
      render: (_: unknown, item: MeetingAgendaItem) => item.presenterName,
    },
    {
      title: 'Duration',
      key: 'duration',
      width: 110,
      render: (_: unknown, item: MeetingAgendaItem) =>
        item.durationMinutes ? `${item.durationMinutes} min` : null,
    },
    ...(canEdit
      ? [
          {
            title: '',
            key: 'actions',
            width: 160,
            render: (_: unknown, item: MeetingAgendaItem, index: number) => (
              <Space size={2}>
                <Button
                  size="small"
                  type="text"
                  icon={<ArrowUpOutlined />}
                  disabled={index === 0}
                  title="Move up"
                  onClick={() => move(index, -1)}
                />
                <Button
                  size="small"
                  type="text"
                  icon={<ArrowDownOutlined />}
                  disabled={index === meeting.agenda.length - 1}
                  title="Move down"
                  onClick={() => move(index, 1)}
                />
                <Button
                  size="small"
                  type="text"
                  icon={<EditOutlined />}
                  title="Edit"
                  onClick={() => setEditing(item)}
                />
                <Popconfirm
                  title="Remove this agenda item?"
                  okText="Remove"
                  okButtonProps={{ danger: true }}
                  onConfirm={() =>
                    change(
                      () => provider.removeAgendaItem(meeting._id, item._id),
                      'Agenda item removed'
                    )
                  }
                >
                  <Button
                    size="small"
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    title="Remove"
                  />
                </Popconfirm>
              </Space>
            ),
          },
        ]
      : []),
  ];

  return (
    <>
      <div className="list-table-header">
        <Space size={12}>
          {canEdit ? (
            <Button
              type="primary"
              icon={<PlusCircleOutlined />}
              onClick={() => setEditing('new')}
            >
              Add Item
            </Button>
          ) : null}
        </Space>
        <div className="list-table-header-utilities">
          {totalMinutes ? (
            <Typography.Text type="secondary">
              Planned: {totalMinutes} min
            </Typography.Text>
          ) : null}
        </div>
      </div>
      <div className="list-container">
        <Table
          className="list-table"
          size="middle"
          bordered
          tableLayout="fixed"
          rowKey="_id"
          dataSource={meeting.agenda}
          columns={columns}
          pagination={false}
          locale={{ emptyText: 'No agenda yet' }}
        />
      </div>

      <Modal
        open={!!editing}
        title={editing === 'new' ? 'Add Agenda Item' : 'Edit Agenda Item'}
        okText={editing === 'new' ? 'Add' : 'Save'}
        confirmLoading={saving}
        onCancel={() => setEditing(null)}
        destroyOnHidden
        onOk={async () => {
          const values = await form.validateFields();
          const input: AgendaItemInput = {
            title: values.title,
            description: values.description?.trim() || null,
            durationMinutes: values.durationMinutes ?? null,
            presenterId: values.presenterId ?? null,
          };
          setSaving(true);
          const saved = await change(
            () =>
              editing === 'new'
                ? provider.addAgendaItem(meeting._id, input)
                : provider.updateAgendaItem(
                    meeting._id,
                    (editing as MeetingAgendaItem)._id,
                    input
                  ),
            editing === 'new' ? 'Agenda item added' : 'Agenda item saved'
          );
          setSaving(false);
          if (saved) setEditing(null);
        }}
      >
        <Form form={form} layout="vertical" style={{ width: '100%' }}>
          <Form.Item
            name="title"
            label="Item"
            rules={[{ required: true, whitespace: true, message: 'Enter the item' }]}
          >
            <Input maxLength={255} autoFocus />
          </Form.Item>
          <Form.Item name="description" label="Details">
            <Input.TextArea rows={3} maxLength={10000} />
          </Form.Item>
          <Space size={12} align="start" wrap>
            <Form.Item name="presenterId" label="Presenter">
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                style={{ width: 260 }}
                options={presenterOptions}
              />
            </Form.Item>
            <Form.Item name="durationMinutes" label="Duration (minutes)">
              <InputNumber min={1} max={1440} precision={0} />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </>
  );
};

export default AgendaPanel;
