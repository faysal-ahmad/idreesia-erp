import React from 'react';
import { Form, type FormInstance } from 'antd';

import {
  ColorField,
  InputTextAreaField,
  InputTextField,
  SelectField,
} from '/imports/ui/modules/helpers/fields';
import { useAllMSDuties } from '/imports/ui/modules/hr/common/hooks';

export interface TeamFormValues {
  name: string;
  color?: string;
  description?: string;
  dutyId?: string | null;
}

interface TeamFormProps {
  form: FormInstance<TeamFormValues>;
}

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const TeamForm = ({ form }: TeamFormProps) => {
  const { allMSDuties } = useAllMSDuties();
  const duties = (allMSDuties ?? []).filter(
    (duty): duty is { _id: string; name: string } =>
      duty?._id != null && duty.name != null
  );

  return (
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
      <SelectField
        data={duties}
        fieldName="dutyId"
        fieldLabel="Duty"
        fieldLayout={formItemLayout}
        placeholder="Select a duty"
        required={false}
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
};

export default TeamForm;
