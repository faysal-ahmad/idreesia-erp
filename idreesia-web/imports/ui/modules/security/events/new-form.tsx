import React from 'react';
import { DatePicker, Form, Input, type FormInstance } from 'antd';
import type { Dayjs } from 'dayjs';

export interface NewEventFormValues {
  name: string;
  eventDate: Dayjs;
}

interface NewFormProps {
  form: FormInstance<NewEventFormValues>;
}

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const NewForm = ({ form }: NewFormProps) => (
  <Form
    form={form}
    layout="horizontal"
    style={{ width: '100%', maxWidth: '100%' }}
    preserve={false}
  >
    <Form.Item
      name="name"
      label="Event Name"
      rules={[
        {
          required: true,
          message: 'Please input a name for the event.',
        },
      ]}
      {...formItemLayout}
    >
      <Input />
    </Form.Item>
    <Form.Item
      name="eventDate"
      label="Event Date"
      rules={[
        {
          required: true,
          message: 'Please input a date for the event.',
        },
      ]}
      {...formItemLayout}
    >
      <DatePicker format="DD MMM, YYYY" style={{ width: '100%' }} />
    </Form.Item>
  </Form>
);

export default NewForm;
