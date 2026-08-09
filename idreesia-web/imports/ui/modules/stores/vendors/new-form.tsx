import React from 'react';
import { Form, type FormInstance } from 'antd';

import {
  InputTextField,
  InputTextAreaField,
} from '/imports/ui/modules/helpers/fields';

export interface NewVendorFormValues {
  name: string;
  contactPerson?: string;
  contactNumber?: string;
  address?: string;
  notes?: string;
}

interface NewFormProps {
  form: FormInstance<NewVendorFormValues>;
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
    <InputTextField
      fieldName="name"
      fieldLabel="Name"
      required
      requiredMessage="Please input a name for the vendor."
      fieldLayout={formItemLayout}
    />
    <InputTextField
      fieldName="contactPerson"
      fieldLabel="Contact Person"
      fieldLayout={formItemLayout}
    />
    <InputTextField
      fieldName="contactNumber"
      fieldLabel="Contact Number"
      fieldLayout={formItemLayout}
    />
    <InputTextAreaField
      fieldName="address"
      fieldLabel="Address"
      fieldLayout={formItemLayout}
    />
    <InputTextAreaField
      fieldName="notes"
      fieldLabel="Notes"
      fieldLayout={formItemLayout}
    />
  </Form>
);

export default NewForm;
