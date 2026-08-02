import React from 'react';
import { Form } from 'antd';
import type { FormInstance } from 'antd/es/form';

import {
  InputTextField,
  InputTextAreaField,
} from '/imports/ui/modules/helpers/fields';

interface AttachmentValues {
  name?: string;
  description?: string;
}

interface Props {
  form?: FormInstance;
  defaultValues?: AttachmentValues;
}

const AttachmentForm = ({ form, defaultValues = {} }: Props) => (
  <Form form={form} layout="horizontal">
    <InputTextField
      fieldName="name"
      fieldLabel="Name"
      initialValue={defaultValues.name}
    />

    <InputTextAreaField
      fieldName="description"
      fieldLabel="Description"
      initialValue={defaultValues.description}
    />
  </Form>
);

export default AttachmentForm;
