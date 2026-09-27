import React from 'react';
import { Form, type FormInstance } from 'antd';

import {
  ColorField,
  InputTextAreaField,
  InputTextField,
} from '/imports/ui/modules/helpers/fields';

export interface TeamFormValues {
  name: string;
  color?: string;
  description?: string;
}

interface TeamFormProps {
  form: FormInstance<TeamFormValues>;
}

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const TeamForm = ({ form }: TeamFormProps) => (
  <Form
    form={form}
    layout="horizontal"
    style={{ width: '100%', maxWidth: '100%' }}
    preserve={false}
  >
    <InputTextField
      fieldName="name"
      fieldLabel="Name"
      fieldLayout={formItemLayout}
      required
      requiredMessage="Please input a name for the team."
    />
    <ColorField
      fieldName="color"
      fieldLabel="Color"
      fieldLayout={formItemLayout}
    />
    <InputTextAreaField
      fieldName="description"
      fieldLabel="Description"
      fieldLayout={formItemLayout}
    />
  </Form>
);

export default TeamForm;
