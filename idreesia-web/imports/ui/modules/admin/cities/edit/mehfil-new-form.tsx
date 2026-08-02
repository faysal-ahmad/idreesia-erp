import React, { useState } from 'react';
import { Form } from 'antd';

import type { CreateCityMehfilMutationVariables } from 'meteor/idreesia-common/types/client-operations';
import {
  InputTextField,
  InputTextAreaField,
  SwitchField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

import type { MehfilFormValues } from './mehfil-edit-form';

interface Props {
  handleSave?(
    values: Omit<CreateCityMehfilMutationVariables, 'cityId'>
  ): void;
  handleCancel?(): void;
}

const NewForm = ({ handleSave, handleCancel }: Props) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({
    name,
    address,
    mehfilStartYear,
    timingDetails,
    lcdAvailability,
    tabAvailability,
    otherMehfilDetails,
  }: MehfilFormValues) => {
    handleSave?.({
      name: name!,
      address,
      mehfilStartYear,
      timingDetails,
      lcdAvailability,
      tabAvailability,
      otherMehfilDetails,
    });
  };

  return (
    <Form layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
      <InputTextField
        fieldName="name"
        fieldLabel="Name"
        required
        requiredMessage="Please input a name for the mehfil."
      />
      <InputTextAreaField
        fieldName="address"
        fieldLabel="Address"
      />
      <InputTextField
        fieldName="mehfilStartYear"
        fieldLabel="Start Year"
      />
      <InputTextAreaField
        fieldName="timingDetails"
        fieldLabel="Timings"
      />
      <SwitchField
        fieldName="lcdAvailability"
        fieldLabel="LCD Available"
      />
      <SwitchField
        fieldName="tabAvailability"
        fieldLabel="Tablet Available"
      />
      <InputTextAreaField
        fieldName="otherMehfilDetails"
        fieldLabel="Other Details"
      />
      <FormButtonsSaveCancel
        handleCancel={handleCancel}
        isFieldsTouched={isFieldsTouched}
      />
    </Form>
  );
};

export default NewForm;
