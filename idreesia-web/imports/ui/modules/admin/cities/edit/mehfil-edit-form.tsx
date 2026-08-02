import React, { useState } from 'react';
import { Form } from 'antd';

import type {
  CityMehfilsByCityIdQuery,
  UpdateCityMehfilMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';
import {
  InputTextField,
  InputTextAreaField,
  SwitchField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

export interface MehfilFormValues {
  name?: string;
  address?: string;
  mehfilStartYear?: string;
  timingDetails?: string;
  lcdAvailability?: boolean;
  tabAvailability?: boolean;
  otherMehfilDetails?: string;
}

type CityMehfil = NonNullable<
  NonNullable<CityMehfilsByCityIdQuery['cityMehfilsByCityId']>[number]
> & { _id: string };

interface Props {
  cityMehfil?: CityMehfil | null;
  handleSave?(values: UpdateCityMehfilMutationVariables): void;
  handleCancel?(): void;
}

const EditForm = ({ cityMehfil, handleSave, handleCancel }: Props) => {
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
      _id: cityMehfil!._id,
      cityId: cityMehfil!.cityId!,
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
        initialValue={cityMehfil?.name}
        required
        requiredMessage="Please input a name for the mehfil."
      />
      <InputTextAreaField
        fieldName="address"
        fieldLabel="Address"
        initialValue={cityMehfil?.address}
      />
      <InputTextField
        fieldName="mehfilStartYear"
        fieldLabel="Start Year"
        initialValue={cityMehfil?.mehfilStartYear}
      />
      <InputTextAreaField
        fieldName="timingDetails"
        fieldLabel="Timings"
        initialValue={cityMehfil?.timingDetails}
      />
      <SwitchField
        fieldName="lcdAvailability"
        fieldLabel="LCD Available"
        initialValue={cityMehfil?.lcdAvailability ?? undefined}
      />
      <SwitchField
        fieldName="tabAvailability"
        fieldLabel="Tablet Available"
        initialValue={cityMehfil?.tabAvailability ?? undefined}
      />
      <InputTextAreaField
        fieldName="otherMehfilDetails"
        fieldLabel="Other Details"
        initialValue={cityMehfil?.otherMehfilDetails}
      />
      <FormButtonsSaveCancel
        handleCancel={handleCancel}
        isFieldsTouched={isFieldsTouched}
      />
    </Form>
  );
};

export default EditForm;
