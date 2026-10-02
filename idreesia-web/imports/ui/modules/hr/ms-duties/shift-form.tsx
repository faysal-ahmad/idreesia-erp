import React from 'react';
import { Form, Input, TimePicker, type FormInstance } from 'antd';

export interface ShiftFormValues {
  name: string;
  startTime?: unknown;
  endTime?: unknown;
}

interface ShiftFormProps {
  form: FormInstance<ShiftFormValues>;
}

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const ShiftForm = ({ form }: ShiftFormProps) => (
  <Form
    form={form}
    layout="horizontal"
    style={{ width: '100%', maxWidth: '100%' }}
    preserve={false}
  >
    <Form.Item
      name="name"
      label="Name"
      rules={[
        {
          required: true,
          message: 'Please input a name for the duty shift.',
        },
      ]}
      {...formItemLayout}
    >
      <Input />
    </Form.Item>
    <Form.Item name="startTime" label="Start Time" {...formItemLayout}>
      <TimePicker use12Hours format="h:mm a" style={{ width: '100%' }} />
    </Form.Item>
    <Form.Item name="endTime" label="End Time" {...formItemLayout}>
      <TimePicker use12Hours format="h:mm a" style={{ width: '100%' }} />
    </Form.Item>
  </Form>
);

export default ShiftForm;
