import React from 'react';
import { Form, Input, InputNumber, type FormInstance } from 'antd';

export interface NewVendorFormValues {
  name: string;
  contactPerson?: string;
  phone?: string;
  paymentTermsDays?: number | null;
}

interface NewFormProps {
  form: FormInstance<NewVendorFormValues>;
}

const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

// Only the essentials: everything else is filled in on the edit page.
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
      rules={[{ required: true, message: 'Please input the vendor name.' }]}
      {...formItemLayout}
    >
      <Input />
    </Form.Item>
    <Form.Item name="contactPerson" label="Contact Person" {...formItemLayout}>
      <Input />
    </Form.Item>
    <Form.Item name="phone" label="Phone" {...formItemLayout}>
      <Input />
    </Form.Item>
    <Form.Item
      name="paymentTermsDays"
      label="Payment Terms (days)"
      {...formItemLayout}
    >
      <InputNumber min={0} precision={0} />
    </Form.Item>
  </Form>
);

export default NewForm;
