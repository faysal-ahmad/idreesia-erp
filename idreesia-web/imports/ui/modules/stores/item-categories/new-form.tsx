import React from 'react';
import { Form, type FormInstance } from 'antd';

import { InputTextField } from '/imports/ui/modules/helpers/fields';

export interface NewItemCategoryFormValues {
  name: string;
}

interface NewFormProps {
  form: FormInstance<NewItemCategoryFormValues>;
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
      requiredMessage="Please input a name for the item category."
      fieldLayout={formItemLayout}
    />
  </Form>
);

export default NewForm;
