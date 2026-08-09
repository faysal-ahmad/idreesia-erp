import React from 'react';
import { Form, Input, type FormInstance } from 'antd';

export interface NewDutyFormValues {
  name: string;
  description?: string;
  attendanceSheet?: string;
}

interface NewFormProps {
  form: FormInstance<NewDutyFormValues>;
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
      label="Duty Name"
      rules={[
        {
          required: true,
          message: 'Please input a name for the duty.',
        },
      ]}
      {...formItemLayout}
    >
      <Input />
    </Form.Item>
    <Form.Item name="description" label="Description" {...formItemLayout}>
      <Input.TextArea rows={4} />
    </Form.Item>
    <Form.Item
      name="attendanceSheet"
      label="Attendance Sheet"
      {...formItemLayout}
    >
      <Input />
    </Form.Item>
  </Form>
);

export default NewForm;
