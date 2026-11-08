import React, { useEffect, useState } from 'react';
import { ActionSheet, Button, DatePicker, Dialog, Form, Input, List, Picker, Popup, Tag, TextArea, Toast } from 'antd-mobile';
import type { Action } from 'antd-mobile/es/components/action-sheet';
import { AddOutline, CheckCircleOutline } from 'antd-mobile-icons';
import { useApolloClient, useMutation } from '@apollo/client/react';
import type { MobileWorkspaceMeetingActionItemFieldsFragment } from 'meteor/idreesia-common/types/client-operations';

import { PagedList } from '../../components';
import { getErrorMessage } from '../../auth/accounts';
import { usePagedQuery } from '../../hooks';
import { ACTION_ITEM_COLORS, ACTION_ITEM_STATUS_LABELS, formatDate, formatDay, toDate } from './format';
import {
  MOBILE_MEETING_CREATE_ACTION_ITEM,
  MOBILE_MEETING_DELETE_ACTION_ITEM,
  MOBILE_MEETING_SET_ACTION_ITEM_STATUS,
  MOBILE_MEETING_UPDATE_ACTION_ITEM,
  MOBILE_WORKSPACE_MEETING_ACTION_ITEMS,
  MOBILE_WORKSPACE_MEETING_BY_ID,
} from './gql';
import { MeetingPartPage, useMeetingPart } from './meeting-part';

type Item = MobileWorkspaceMeetingActionItemFieldsFragment & { _id: string };

interface ItemValues {
  title: string;
  description?: string;
  assigneeId?: string[];
  dueDate?: Date | null;
  agendaItemId?: string[];
}

const isOverdue = (item: Item) => {
  const due = toDate(item.dueDate);
  if (!due || (item.status !== 'open' && item.status !== 'in-progress')) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
};

/** Tasks that came out of a meeting. */
export const ActionItemsScreen = () => {
  const part = useMeetingPart();
  const { committeeId, meetingId, members, participants, agenda, canManage, canChange } = part;
  const canEdit = canManage && canChange;
  const client = useApolloClient();
  const [form] = Form.useForm<ItemValues>();
  const [editing, setEditing] = useState<Item | 'new' | null>(null);
  const [selected, setSelected] = useState<Item | null>(null);
  const [assigneeOpen, setAssigneeOpen] = useState(false);
  const [agendaOpen, setAgendaOpen] = useState(false);
  const [dueOpen, setDueOpen] = useState(false);

  const [createItem, { loading: creating }] = useMutation(MOBILE_MEETING_CREATE_ACTION_ITEM);
  const [updateItem, { loading: updating }] = useMutation(MOBILE_MEETING_UPDATE_ACTION_ITEM);
  const [setStatus] = useMutation(MOBILE_MEETING_SET_ACTION_ITEM_STATUS);
  const [deleteItem] = useMutation(MOBILE_MEETING_DELETE_ACTION_ITEM);

  const paged = usePagedQuery(MOBILE_WORKSPACE_MEETING_ACTION_ITEMS, {
    filter: { committeeId, meetingId },
    toVariables: (filter, { pageIndex, pageSize }) => ({
      ...filter,
      pageIndex: Number(pageIndex),
      pageSize: Number(pageSize),
    }),
    getPage: data => data.workspaceMeetingActionItems,
    getKey: item => item._id,
  });

  useEffect(() => {
    if (!editing) return;
    form.resetFields();
    if (editing !== 'new') {
      form.setFieldsValue({
        title: editing.title ?? '',
        description: editing.description ?? '',
        assigneeId: editing.assigneeId ? [editing.assigneeId] : [],
        dueDate: toDate(editing.dueDate),
        agendaItemId: editing.agendaItemId ? [editing.agendaItemId] : [],
      });
    }
  }, [editing, form]);

  // The list and the meeting's open count.
  const reload = () =>
    Promise.all([
      paged.refresh(),
      client.query({
        query: MOBILE_WORKSPACE_MEETING_BY_ID,
        variables: { committeeId, meetingId },
        fetchPolicy: 'network-only',
      }),
    ]).catch(() => undefined);

  const run = async (action: () => Promise<unknown>, success: string, failure: string) => {
    try {
      await action();
      Toast.show({ icon: 'success', content: success });
      await reload();
      return true;
    } catch (actionError) {
      Toast.show({ icon: 'fail', content: getErrorMessage(actionError, failure) });
      return false;
    }
  };

  // Assignees: the participants first, then any other member.
  const participantIds = new Set(participants.map(p => p.participantId));
  const assigneeColumns = [
    [
      { value: '', label: 'Unassigned' },
      ...[...members]
        .sort((a, b) => Number(participantIds.has(b.participantId)) - Number(participantIds.has(a.participantId)))
        .map(member => ({ value: member.participantId, label: member.name ?? member.participantId })),
    ],
  ];
  const agendaColumns = [[{ value: '', label: 'None' }, ...agenda.map(item => ({ value: item._id, label: item.title ?? '' }))]];
  const agendaTitles = new Map(agenda.map(item => [item._id, item.title]));

  const save = async (values: ItemValues) => {
    const input = {
      title: values.title.trim(),
      description: values.description?.trim() || null,
      assigneeId: values.assigneeId?.[0] || null,
      dueDate: values.dueDate ? String(new Date(values.dueDate).setHours(0, 0, 0, 0)) : null,
      agendaItemId: values.agendaItemId?.[0] || null,
    };
    const saved = await run(
      () =>
        editing === 'new'
          ? createItem({ variables: { committeeId, meetingId, input } })
          : updateItem({ variables: { committeeId, actionItemId: (editing as Item)._id, input } }),
      editing === 'new' ? 'Action item added.' : 'Action item saved.',
      'Could not save the action item.',
    );
    if (saved) setEditing(null);
  };

  const actions: Action[] = selected
    ? [
        ...(selected.canChangeStatus && canChange
          ? Object.entries(ACTION_ITEM_STATUS_LABELS)
              .filter(([status]) => status !== selected.status)
              .map(([status, label]) => ({
                key: `status-${status}`,
                text: `Mark ${label.toLowerCase()}`,
                onClick: () =>
                  run(
                    () => setStatus({ variables: { committeeId, actionItemId: selected._id, status } }),
                    'Status changed.',
                    'Could not change the status.',
                  ),
              }))
          : []),
        ...(canEdit
          ? [
              { key: 'edit', text: 'Edit', onClick: () => setEditing(selected) },
              {
                key: 'delete',
                text: 'Delete',
                danger: true,
                onClick: async () => {
                  const confirmed = await Dialog.confirm({
                    content: `Delete "${selected.title}"?`,
                    confirmText: <span className="meeting-danger-text">Delete</span>,
                    cancelText: 'Cancel',
                  });
                  if (confirmed) {
                    run(
                      () => deleteItem({ variables: { committeeId, actionItemId: selected._id } }),
                      'Action item deleted.',
                      'Could not delete the action item.',
                    );
                  }
                },
              },
            ]
          : []),
      ]
    : [];

  const labelOf = (columns: typeof assigneeColumns, value?: string) =>
    columns[0].find(option => option.value === value)?.label;

  return (
    <MeetingPartPage
      part={part}
      title="Action items"
      right={
        canEdit ? (
          <div className="page-nav-actions">
            <AddOutline aria-label="Add action item" className="page-nav-action" onClick={() => setEditing('new')} />
          </div>
        ) : undefined
      }
    >
      {() => (
        <>
          <PagedList
            emptyDescription={canEdit ? 'Tap + to add one.' : undefined}
            emptyTitle="No action items"
            getKey={item => item._id ?? ''}
            itemsLabel="action items"
            paged={paged}
            renderItem={row => {
              const item = row as Item;
              const tappable = canChange && (item.canChangeStatus || canEdit);
              return (
                <List.Item
                  clickable={tappable}
                  description={
                    <>
                      <div>
                        {item.assigneeName ?? 'Unassigned'}
                        {item.dueDate && (
                          <span className={isOverdue(item) ? 'meeting-overdue' : undefined}>
                            {' '}
                            · Due {formatDate(item.dueDate)}
                          </span>
                        )}
                      </div>
                      {item.agendaItemId && agendaTitles.get(item.agendaItemId) && (
                        <div>Agenda: {agendaTitles.get(item.agendaItemId)}</div>
                      )}
                    </>
                  }
                  extra={
                    <Tag color={ACTION_ITEM_COLORS[item.status ?? 'open']} fill="outline">
                      {ACTION_ITEM_STATUS_LABELS[item.status ?? 'open']}
                    </Tag>
                  }
                  prefix={
                    <span className="list-icon">
                      <CheckCircleOutline />
                    </span>
                  }
                  onClick={tappable ? () => setSelected(item) : undefined}
                >
                  <div>{item.title}</div>
                  {item.description && <div className="meeting-pre-wrap meeting-muted">{item.description}</div>}
                </List.Item>
              );
            }}
          />

          <ActionSheet
            actions={actions}
            cancelText="Close"
            closeOnAction
            extra={selected?.title ?? undefined}
            visible={!!selected}
            onClose={() => setSelected(null)}
          />

          <Popup
            bodyClassName="meeting-form-popup"
            destroyOnClose
            position="bottom"
            visible={!!editing}
            onMaskClick={() => setEditing(null)}
          >
            <Form
              form={form}
              layout="vertical"
              mode="card"
              onFinish={save}
              footer={
                <Button block color="primary" loading={creating || updating} size="large" type="submit">
                  {editing === 'new' ? 'Add action item' : 'Save action item'}
                </Button>
              }
            >
              <Form.Header>{editing === 'new' ? 'New action item' : 'Edit action item'}</Form.Header>
              <Form.Item
                label="Action item"
                name="title"
                rules={[{ required: true, whitespace: true, message: 'Please enter the action item.' }]}
              >
                <Input autoCapitalize="sentences" clearable maxLength={255} placeholder="What needs doing" />
              </Form.Item>
              <Form.Item label="Details" name="description">
                <TextArea autoSize={{ minRows: 2, maxRows: 5 }} maxLength={10000} placeholder="Details" />
              </Form.Item>
              <Form.Item label="Assignee" name="assigneeId" trigger="onConfirm" onClick={() => setAssigneeOpen(true)}>
                <Picker columns={assigneeColumns} visible={assigneeOpen} onClose={() => setAssigneeOpen(false)}>
                  {items => labelOf(assigneeColumns, items[0]?.value as string) ?? 'Choose'}
                </Picker>
              </Form.Item>
              <Form.Item label="Due date" name="dueDate" trigger="onConfirm" onClick={() => setDueOpen(true)}>
                <DatePicker visible={dueOpen} onClose={() => setDueOpen(false)}>
                  {value => (value ? formatDay(value) : 'Choose')}
                </DatePicker>
              </Form.Item>
              {agenda.length > 0 && (
                <Form.Item label="Agenda item" name="agendaItemId" trigger="onConfirm" onClick={() => setAgendaOpen(true)}>
                  <Picker columns={agendaColumns} visible={agendaOpen} onClose={() => setAgendaOpen(false)}>
                    {items => labelOf(agendaColumns, items[0]?.value as string) ?? 'Choose'}
                  </Picker>
                </Form.Item>
              )}
            </Form>
          </Popup>
        </>
      )}
    </MeetingPartPage>
  );
};
