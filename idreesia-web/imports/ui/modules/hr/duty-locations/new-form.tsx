import React from 'react';
import { Form, Input, type FormInstance } from 'antd';

export interface NewDutyLocationFormValues {
  name: string;
}

interface NewFormProps {
  form: FormInstance<NewDutyLocationFormValues>;
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
      label="Name"
      rules={[
        {
          required: true,
          message: 'Please input a name for the duty location.',
        },
      ]}
      {...formItemLayout}
    >
      <Input />
    </Form.Item>
  </Form>
);

export default NewForm;
