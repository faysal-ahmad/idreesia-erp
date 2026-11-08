import React, { useEffect, useState } from 'react';
import { ActionSheet, Button, Dialog, Form, Input, List, Picker, Popup, Stepper, TextArea } from 'antd-mobile';
import type { Action } from 'antd-mobile/es/components/action-sheet';
import { AddOutline, UnorderedListOutline } from 'antd-mobile-icons';
import { useMutation } from '@apollo/client/react';

import { PageEmpty, showError, showSuccess } from '../../layout';
import {
  MOBILE_MEETING_ADD_AGENDA_ITEM,
  MOBILE_MEETING_REMOVE_AGENDA_ITEM,
  MOBILE_MEETING_REORDER_AGENDA,
  MOBILE_MEETING_UPDATE_AGENDA_ITEM,
} from './gql';
import { MeetingPartPage, useMeetingPart } from './meeting-part';
import type { AgendaItem } from './use-meeting';

interface ItemValues {
  title: string;
  description?: string;
  durationMinutes?: number | null;
  presenterId?: string[];
}

/** A meeting's agenda, in order. Coordinators add, edit, reorder and remove items. */
export const AgendaScreen = () => {
  const part = useMeetingPart();
  const { committeeId, meetingId, agenda, members, participants, canManage, canChange } = part;
  const canEdit = canManage && canChange;
  const [form] = Form.useForm<ItemValues>();
  const [editing, setEditing] = useState<(AgendaItem & { _id: string }) | 'new' | null>(null);
  const [menuItem, setMenuItem] = useState<(AgendaItem & { _id: string }) | null>(null);
  const [presenterOpen, setPresenterOpen] = useState(false);

  const [addItem, { loading: adding }] = useMutation(MOBILE_MEETING_ADD_AGENDA_ITEM);
  const [updateItem, { loading: updating }] = useMutation(MOBILE_MEETING_UPDATE_AGENDA_ITEM);
  const [removeItem] = useMutation(MOBILE_MEETING_REMOVE_AGENDA_ITEM);
  const [reorder] = useMutation(MOBILE_MEETING_REORDER_AGENDA);

  useEffect(() => {
    if (!editing) return;
    form.resetFields();
    if (editing !== 'new') {
      form.setFieldsValue({
        title: editing.title ?? '',
        description: editing.description ?? '',
        durationMinutes: editing.durationMinutes ?? null,
        presenterId: editing.presenterId ? [editing.presenterId] : [],
      });
    }
  }, [editing, form]);

  // Presenters: the participants first, then any other member.
  const participantIds = new Set(participants.map(p => p.participantId));
  const presenterColumns = [
    [{ value: '', label: 'No presenter' }, ...[...members]
      .sort((a, b) => Number(participantIds.has(b.participantId)) - Number(participantIds.has(a.participantId)))
      .map(member => ({ value: member.participantId, label: member.name ?? member.participantId }))],
  ];
  const presenterName = (id?: string) =>
    members.find(member => member.participantId === id)?.name ?? '';

  const run = async (action: () => Promise<unknown>, success: string, failure: string) => {
    try {
      await action();
      showSuccess(success);
      return true;
    } catch (actionError) {
      showError(actionError, failure);
      return false;
    }
  };

  const move = (index: number, by: number) => {
    const ids = agenda.map(item => item._id);
    const [id] = ids.splice(index, 1);
    ids.splice(index + by, 0, id);
    run(
      () => reorder({ variables: { committeeId, meetingId, agendaItemIds: ids } }),
      'Agenda reordered.',
      'Could not reorder the agenda.',
    );
  };

  const save = async (values: ItemValues) => {
    const input = {
      title: values.title.trim(),
      description: values.description?.trim() || null,
      durationMinutes: values.durationMinutes || null,
      presenterId: values.presenterId?.[0] || null,
    };
    const saved = await run(
      () =>
        editing === 'new'
          ? addItem({ variables: { committeeId, meetingId, input } })
          : updateItem({
              variables: { committeeId, meetingId, agendaItemId: (editing as AgendaItem & { _id: string })._id, input },
            }),
      editing === 'new' ? 'Agenda item added.' : 'Agenda item saved.',
      'Could not save the agenda item.',
    );
    if (saved) setEditing(null);
  };

  const menuIndex = menuItem ? agenda.findIndex(item => item._id === menuItem._id) : -1;
  const menuActions: Action[] = menuItem
    ? [
        { key: 'edit', text: 'Edit', onClick: () => setEditing(menuItem) },
        ...(menuIndex > 0 ? [{ key: 'up', text: 'Move up', onClick: () => move(menuIndex, -1) }] : []),
        ...(menuIndex < agenda.length - 1
          ? [{ key: 'down', text: 'Move down', onClick: () => move(menuIndex, 1) }]
          : []),
        {
          key: 'remove',
          text: 'Remove',
          danger: true,
          onClick: async () => {
            const confirmed = await Dialog.confirm({
              content: `Remove "${menuItem.title}" from the agenda?`,
              confirmText: <span className="meeting-danger-text">Remove</span>,
              cancelText: 'Cancel',
            });
            if (confirmed) {
              run(
                () => removeItem({ variables: { committeeId, meetingId, agendaItemId: menuItem._id } }),
                'Agenda item removed.',
                'Could not remove the agenda item.',
              );
            }
          },
        },
      ]
    : [];

  const totalMinutes = agenda.reduce((sum, item) => sum + (item.durationMinutes ?? 0), 0);

  return (
    <MeetingPartPage
      part={part}
      title="Agenda"
      right={
        canEdit ? (
          <div className="page-nav-actions">
            <AddOutline aria-label="Add agenda item" className="page-nav-action" onClick={() => setEditing('new')} />
          </div>
        ) : undefined
      }
    >
      {() => (
        <>
          {agenda.length === 0 ? (
            <PageEmpty
              description={canEdit ? 'Tap + to add an item.' : undefined}
              icon={<UnorderedListOutline />}
              title="No agenda yet"
            />
          ) : (
            <>
              {totalMinutes > 0 && <p className="paged-list-count">Planned: {totalMinutes} min</p>}
              <List mode="card">
                {agenda.map((item, index) => (
                  <List.Item
                    key={item._id}
                    clickable={canEdit}
                    description={
                      [item.presenterName, item.durationMinutes ? `${item.durationMinutes} min` : null]
                        .filter(Boolean)
                        .join(' · ') || undefined
                    }
                    prefix={<span className="meeting-agenda-number">{index + 1}</span>}
                    onClick={canEdit ? () => setMenuItem(item) : undefined}
                  >
                    <div>{item.title}</div>
                    {item.description && <div className="meeting-pre-wrap meeting-muted">{item.description}</div>}
                  </List.Item>
                ))}
              </List>
            </>
          )}

          <ActionSheet
            actions={menuActions}
            cancelText="Close"
            closeOnAction
            visible={!!menuItem}
            onClose={() => setMenuItem(null)}
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
                <Button block color="primary" loading={adding || updating} size="large" type="submit">
                  {editing === 'new' ? 'Add item' : 'Save item'}
                </Button>
              }
            >
              <Form.Header>{editing === 'new' ? 'New agenda item' : 'Edit agenda item'}</Form.Header>
              <Form.Item
                label="Item"
                name="title"
                rules={[{ required: true, whitespace: true, message: 'Please enter the item.' }]}
              >
                <Input autoCapitalize="sentences" clearable maxLength={255} placeholder="Item" />
              </Form.Item>
              <Form.Item label="Details" name="description">
                <TextArea autoSize={{ minRows: 2, maxRows: 5 }} maxLength={10000} placeholder="Details" />
              </Form.Item>
              <Form.Item
                label="Presenter"
                name="presenterId"
                trigger="onConfirm"
                onClick={() => setPresenterOpen(true)}
              >
                <Picker columns={presenterColumns} visible={presenterOpen} onClose={() => setPresenterOpen(false)}>
                  {items => (items[0]?.value ? presenterName(items[0].value as string) : 'Choose')}
                </Picker>
              </Form.Item>
              <Form.Item label="Duration (minutes)" name="durationMinutes">
                <Stepper digits={0} max={1440} min={0} step={5} />
              </Form.Item>
            </Form>
          </Popup>
        </>
      )}
    </MeetingPartPage>
  );
};
