import React, { useEffect, useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Space,
  TimePicker,
} from 'antd';

import { Formats } from 'meteor/idreesia-common/constants';

import type { Meeting, MeetingDetails, MeetingMember } from './types';

interface FormValues {
  title: string;
  date: Dayjs;
  time: [Dayjs, Dayjs];
  location?: string;
  onlineUrl?: string;
  description?: string;
  participantIds?: string[];
}

/** The date's day with the time's hours and minutes, as ms. */
const combine = (date: Dayjs, time: Dayjs) =>
  String(
    date
      .hour(time.hour())
      .minute(time.minute())
      .second(0)
      .millisecond(0)
      .valueOf()
  );

const toDetails = (values: FormValues): MeetingDetails => ({
  title: values.title,
  startsAt: combine(values.date, values.time[0]),
  endsAt: combine(values.date, values.time[1]),
  location: values.location?.trim() || null,
  onlineUrl: values.onlineUrl?.trim() || null,
  description: values.description?.trim() || null,
});

/** The next full hour, for a new meeting's default time. */
const nextHour = () => dayjs().add(1, 'hour').startOf('hour');

interface Props {
  open: boolean;
  /** Edit this meeting; unset to create one. */
  meeting?: Meeting | null;
  /** A day to schedule on (e.g. picked on the calendar). */
  initialDate?: Dayjs | null;
  /** Who can be invited; create only. */
  members?: MeetingMember[];
  onCancel: () => void;
  onSubmit: (details: MeetingDetails, participantIds: string[]) => Promise<void>;
}

/**
 * Create or edit a meeting's details. Creating also picks the participants
 * (everyone, by default); editing leaves them to the Participants tab.
 */
const MeetingFormModal = ({
  open,
  meeting,
  initialDate,
  members = [],
  onCancel,
  onSubmit,
}: Props) => {
  const [form] = Form.useForm<FormValues>();
  const [saving, setSaving] = useState(false);
  const isEdit = !!meeting;

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    if (meeting) {
      const start = dayjs(Number(meeting.startsAt));
      form.setFieldsValue({
        title: meeting.title,
        date: start,
        time: [start, dayjs(Number(meeting.endsAt))],
        location: meeting.location ?? undefined,
        onlineUrl: meeting.onlineUrl ?? undefined,
        description: meeting.description ?? undefined,
      });
    } else {
      const start = initialDate
        ? initialDate.hour(nextHour().hour()).minute(0)
        : nextHour();
      form.setFieldsValue({
        date: start,
        time: [start, start.add(1, 'hour')],
        participantIds: members.map(({ participantId }) => participantId),
      });
    }
  }, [open, meeting, initialDate, members, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      await onSubmit(toDetails(values), values.participantIds ?? []);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={isEdit ? 'Edit Meeting' : 'New Meeting'}
      okText={isEdit ? 'Save' : 'Schedule'}
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
        <Space size={12} align="start" wrap>
          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: 'Pick a date' }]}
          >
            <DatePicker format={Formats.DATE_FORMAT} allowClear={false} />
          </Form.Item>
          <Form.Item
            name="time"
            label="Time"
            rules={[
              { required: true, message: 'Pick a start and end time' },
              {
                validator: (_, value?: [Dayjs, Dayjs]) =>
                  value && !value[1].isAfter(value[0])
                    ? Promise.reject(new Error('End after it starts'))
                    : Promise.resolve(),
              },
            ]}
          >
            <TimePicker.RangePicker
              format={Formats.TIME_FORMAT}
              use12Hours
              minuteStep={5}
              allowClear={false}
              order={false}
            />
          </Form.Item>
        </Space>
        <Form.Item name="location" label="Location">
          <Input maxLength={1000} placeholder="Where it takes place" />
        </Form.Item>
        <Form.Item
          name="onlineUrl"
          label="Online meeting link"
          rules={[
            {
              type: 'url',
              message: 'Enter a full link, starting with https://',
            },
          ]}
        >
          <Input placeholder="https://" />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} maxLength={10000} />
        </Form.Item>
        {isEdit ? null : (
          <Form.Item
            label={
              <Space size={8}>
                <span>Participants</span>
                <Button
                  type="link"
                  size="small"
                  onClick={() =>
                    form.setFieldsValue({
                      participantIds: members.map(m => m.participantId),
                    })
                  }
                >
                  All members
                </Button>
                <Button
                  type="link"
                  size="small"
                  onClick={() => form.setFieldsValue({ participantIds: [] })}
                >
                  None
                </Button>
              </Space>
            }
            name="participantIds"
          >
            <Select
              mode="multiple"
              allowClear
              optionFilterProp="label"
              placeholder="Choose who to invite"
              maxTagCount="responsive"
              options={members.map(member => ({
                value: member.participantId,
                label: member.name ?? member.participantId,
              }))}
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default MeetingFormModal;
