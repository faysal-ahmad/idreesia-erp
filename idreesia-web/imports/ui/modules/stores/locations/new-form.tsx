import React from 'react';
import { Form, type FormInstance } from 'antd';

import type { LocationsByPhysicalStoreIdQuery } from 'meteor/idreesia-common/types/client-operations';
import {
  InputTextField,
  InputTextAreaField,
  TreeSelectField,
} from '/imports/ui/modules/helpers/fields';

export interface NewLocationFormValues {
  name: string;
  parentId?: string | null;
  description?: string;
}

type LocationOption = NonNullable<
  NonNullable<LocationsByPhysicalStoreIdQuery['locationsByPhysicalStoreId']>[number]
>;

interface NewFormProps {
  form: FormInstance<NewLocationFormValues>;
  locations: LocationOption[];
}

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const NewForm = ({ form, locations }: NewFormProps) => (
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
      requiredMessage="Please input a name for the location."
      fieldLayout={formItemLayout}
    />
    <TreeSelectField
      data={locations}
      fieldName="parentId"
      fieldLabel="Parent Location"
      fieldLayout={formItemLayout}
    />
    <InputTextAreaField
      fieldName="description"
      fieldLabel="Description"
      fieldLayout={formItemLayout}
    />
  </Form>
);

export default NewForm;
