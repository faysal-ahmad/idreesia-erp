import React from 'react';
import { Form, Input, type FormInstance } from 'antd';

export interface NewMehfilDutyFormValues {
  name: string;
  urduName: string;
}

interface NewFormProps {
  form: FormInstance<NewMehfilDutyFormValues>;
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
          message: 'Please input a name for the mehfil duty.',
        },
      ]}
      {...formItemLayout}
    >
      <Input />
    </Form.Item>
    <Form.Item
      name="urduName"
      label="Urdu Name"
      rules={[
        {
          required: true,
          message: 'Please input an urdu name for the mehfil duty.',
        },
      ]}
      {...formItemLayout}
    >
      <Input />
    </Form.Item>
  </Form>
);

export default NewForm;
