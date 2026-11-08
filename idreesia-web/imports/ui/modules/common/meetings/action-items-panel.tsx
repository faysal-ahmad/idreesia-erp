import React, { useCallback, useEffect, useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Pagination,
  Popconfirm,
  Select,
  Space,
  Table,
  Typography,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';

import { Formats } from 'meteor/idreesia-common/constants';
import { message } from '/imports/ui/antd-feedback';

import {
  ACTION_ITEM_STATUS_LABELS,
  ActionItemStatusTag,
  formatDate,
} from './format';
import type {
  ActionItemInput,
  ActionItemStatus,
  MeetingActionItem,
} from './types';
import type { PanelProps } from './panel-props';

const showError = (error: unknown) =>
  message.error(error instanceof Error ? error.message : String(error));

interface ItemFormValues {
  title: string;
  description?: string;
  assigneeId?: string | null;
  dueDate?: Dayjs | null;
  agendaItemId?: string | null;
}

const isOverdue = (item: MeetingActionItem) =>
  !!item.dueDate &&
  (item.status === 'open' || item.status === 'in-progress') &&
  Number(item.dueDate) < dayjs().startOf('day').valueOf();

/** Tasks that came out of the meeting. */
const ActionItemsPanel = ({
  provider,
  meeting,
  info,
  members,
  onMeetingChange,
}: PanelProps) => {
  const canChange = meeting.status !== 'cancelled';
  const canEdit = info.canManage && canChange;
  const [form] = Form.useForm<ItemFormValues>();
  const [items, setItems] = useState<MeetingActionItem[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [editing, setEditing] = useState<MeetingActionItem | 'new' | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await provider.loadActionItems({
        meetingId: meeting._id,
        pageIndex: page - 1,
        pageSize,
      });
      setItems(result.items);
      setTotalResults(result.totalResults);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  }, [provider, meeting._id, page, pageSize]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!editing) return;
    form.resetFields();
    if (editing !== 'new') {
      form.setFieldsValue({
        title: editing.title,
        description: editing.description ?? undefined,
        assigneeId: editing.assigneeId,
        dueDate: editing.dueDate ? dayjs(Number(editing.dueDate)) : null,
        agendaItemId: editing.agendaItemId,
      });
    }
  }, [editing, form]);

  // The meeting's open item count changed.
  const refreshMeeting = async () => {
    const updated = await provider.loadMeeting(meeting._id).catch(() => null);
    if (updated) onMeetingChange(updated);
  };

  const afterChange = async (success: string) => {
    message.success(success, 2);
    await load();
    await refreshMeeting();
  };

  // Assignees: the participants first, then any other member.
  const participantIds = new Set(meeting.participants.map(p => p.participantId));
  const assigneeOptions = [...members]
    .sort(
      (a, b) =>
        Number(participantIds.has(b.participantId)) -
        Number(participantIds.has(a.participantId))
    )
    .map(member => ({
      value: member.participantId,
      label: member.name ?? member.participantId,
    }));
  const agendaTitles = new Map(meeting.agenda.map(item => [item._id, item.title]));

  const columns = [
    {
      title: 'Action Item',
      key: 'title',
      render: (_: unknown, item: MeetingActionItem) => (
        <div>
          <div>{item.title}</div>
          {item.description ? (
            <Typography.Text type="secondary" className="meeting-pre-wrap">
              {item.description}
            </Typography.Text>
          ) : null}
          {item.agendaItemId && agendaTitles.get(item.agendaItemId) ? (
            <div>
              <Typography.Text type="secondary">
                Agenda: {agendaTitles.get(item.agendaItemId)}
              </Typography.Text>
            </div>
          ) : null}
        </div>
      ),
    },
    {
      title: 'Assignee',
      key: 'assignee',
      width: 190,
      ellipsis: true,
      render: (_: unknown, item: MeetingActionItem) =>
        item.assigneeName ?? (
          <Typography.Text type="secondary">Unassigned</Typography.Text>
        ),
    },
    {
      title: 'Due',
      key: 'due',
      width: 120,
      render: (_: unknown, item: MeetingActionItem) =>
        isOverdue(item) ? (
          <Typography.Text type="danger">{formatDate(item.dueDate)}</Typography.Text>
        ) : (
          formatDate(item.dueDate)
        ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 160,
      render: (_: unknown, item: MeetingActionItem) =>
        canChange && item.canChangeStatus ? (
          <Select<ActionItemStatus>
            size="small"
            value={item.status}
            style={{ width: 130 }}
            onChange={async status => {
              try {
                await provider.setActionItemStatus(item._id, status);
                await afterChange('Status changed');
              } catch (error) {
                showError(error);
              }
            }}
            options={Object.entries(ACTION_ITEM_STATUS_LABELS).map(
              ([value, label]) => ({ value: value as ActionItemStatus, label })
            )}
          />
        ) : (
          <ActionItemStatusTag status={item.status} />
        ),
    },
    ...(canEdit
      ? [
          {
            title: '',
            key: 'actions',
            width: 80,
            render: (_: unknown, item: MeetingActionItem) => (
              <Space size={2}>
                <Button
                  size="small"
                  type="text"
                  icon={<EditOutlined />}
                  title="Edit"
                  onClick={() => setEditing(item)}
                />
                <Popconfirm
                  title="Delete this action item?"
                  okText="Delete"
                  okButtonProps={{ danger: true }}
                  onConfirm={async () => {
                    try {
                      await provider.deleteActionItem(item._id);
                      await afterChange('Action item deleted');
                    } catch (error) {
                      showError(error);
                    }
                  }}
                >
                  <Button
                    size="small"
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    title="Delete"
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
              Add Action Item
            </Button>
          ) : null}
        </Space>
        <div className="list-table-header-utilities">
          <Button icon={<SyncOutlined />} onClick={load} title="Reload Data" />
        </div>
      </div>
      <div className="list-container">
        <Table
          className="list-table"
          size="middle"
          bordered
          tableLayout="fixed"
          rowKey="_id"
          loading={loading}
          dataSource={items}
          columns={columns}
          pagination={false}
          locale={{ emptyText: 'No action items' }}
          footer={() => (
            <Pagination
              current={page}
              pageSize={pageSize}
              total={totalResults}
              showSizeChanger
              showTotal={(total: number, range: [number, number]) =>
                `${range[0]}-${range[1]} of ${total} action items`
              }
              onChange={(nextPage, nextPageSize) => {
                setPage(nextPage);
                setPageSize(nextPageSize);
              }}
            />
          )}
        />
      </div>

      <Modal
        open={!!editing}
        title={editing === 'new' ? 'Add Action Item' : 'Edit Action Item'}
        okText={editing === 'new' ? 'Add' : 'Save'}
        confirmLoading={saving}
        onCancel={() => setEditing(null)}
        destroyOnHidden
        onOk={async () => {
          const values = await form.validateFields();
          const input: ActionItemInput = {
            title: values.title,
            description: values.description?.trim() || null,
            assigneeId: values.assigneeId ?? null,
            dueDate: values.dueDate
              ? String(values.dueDate.startOf('day').valueOf())
              : null,
            agendaItemId: values.agendaItemId ?? null,
          };
          setSaving(true);
          try {
            if (editing === 'new') {
              await provider.createActionItem(meeting._id, input);
            } else {
              await provider.updateActionItem(
                (editing as MeetingActionItem)._id,
                input
              );
            }
            setEditing(null);
            await afterChange(
              editing === 'new' ? 'Action item added' : 'Action item saved'
            );
          } catch (error) {
            showError(error);
          } finally {
            setSaving(false);
          }
        }}
      >
        <Form form={form} layout="vertical" style={{ width: '100%' }}>
          <Form.Item
            name="title"
            label="Action item"
            rules={[
              { required: true, whitespace: true, message: 'Enter the action item' },
            ]}
          >
            <Input maxLength={255} autoFocus />
          </Form.Item>
          <Form.Item name="description" label="Details">
            <Input.TextArea rows={3} maxLength={10000} />
          </Form.Item>
          <Space size={12} align="start" wrap>
            <Form.Item name="assigneeId" label="Assignee">
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                style={{ width: 260 }}
                options={assigneeOptions}
              />
            </Form.Item>
            <Form.Item name="dueDate" label="Due date">
              <DatePicker format={Formats.DATE_FORMAT} />
            </Form.Item>
          </Space>
          {meeting.agenda.length ? (
            <Form.Item name="agendaItemId" label="Agenda item">
              <Select
                allowClear
                options={meeting.agenda.map(item => ({
                  value: item._id,
                  label: item.title,
                }))}
              />
            </Form.Item>
          ) : null}
        </Form>
      </Modal>
    </>
  );
};

export default ActionItemsPanel;
