import React from 'react';
import { DatePicker, Form, Input, type FormInstance } from 'antd';
import type { Dayjs } from 'dayjs';

export interface NewMehfilFormValues {
  name: string;
  mehfilDate: Dayjs;
}

interface NewFormProps {
  form: FormInstance<NewMehfilFormValues>;
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
      label="Mehfil Name"
      rules={[
        {
          required: true,
          message: 'Please input a name for the mehfil.',
        },
      ]}
      {...formItemLayout}
    >
      <Input />
    </Form.Item>
    <Form.Item
      name="mehfilDate"
      label="Mehfil Date"
      rules={[
        {
          required: true,
          message: 'Please input a date for the mehfil.',
        },
      ]}
      {...formItemLayout}
    >
      <DatePicker format="DD MMM, YYYY" style={{ width: '100%' }} />
    </Form.Item>
  </Form>
);

export default NewForm;
