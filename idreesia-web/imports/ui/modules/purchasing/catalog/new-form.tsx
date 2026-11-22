import React from 'react';
import { Form, Input, InputNumber, type FormInstance } from 'antd';

export interface NewCatalogItemFormValues {
  name: string;
  unit: string;
  category?: string;
  defaultUnitPrice?: number | null;
}

interface NewFormProps {
  form: FormInstance<NewCatalogItemFormValues>;
}

const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
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
      rules={[{ required: true, message: 'Please input the item name.' }]}
      {...formItemLayout}
    >
      <Input />
    </Form.Item>
    <Form.Item
      name="unit"
      label="Unit"
      rules={[
        { required: true, message: 'Please input the unit (e.g. kg, box).' },
      ]}
      {...formItemLayout}
    >
      <Input />
    </Form.Item>
    <Form.Item name="category" label="Category" {...formItemLayout}>
      <Input />
    </Form.Item>
    <Form.Item
      name="defaultUnitPrice"
      label="Default Unit Price"
      {...formItemLayout}
    >
      <InputNumber min={0} precision={2} />
    </Form.Item>
  </Form>
);

export default NewForm;
