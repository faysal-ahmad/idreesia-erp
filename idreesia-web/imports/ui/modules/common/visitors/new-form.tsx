import React, { useState } from 'react';
import { Divider, Form } from 'antd';
import { type Dayjs } from 'dayjs';

import {
  useDistinctCities,
  useDistinctCountries,
} from 'meteor/idreesia-common/hooks/security';
import {
  AgeField,
  AutoCompleteField,
  EhadDurationField,
  InputCnicField,
  InputMobileField,
  InputTextField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

export interface VisitorNewFormValues {
  name?: string;
  parentName?: string;
  cnicNumber?: string;
  contactNumber1?: string;
  contactNumber2?: string;
  city?: string;
  country?: string;
  currentAddress?: string;
  permanentAddress?: string;
  ehadDate?: Dayjs;
  birthDate?: Dayjs | null;
  referenceName?: string;
  educationalQualification?: string;
  meansOfEarning?: string;
}

interface Props {
  handleFinish(values: VisitorNewFormValues): void;
  handleCancel?(): void;
}

const NewForm = ({ handleFinish, handleCancel }: Props) => {
  const [form] = Form.useForm();
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const { distinctCities, distinctCitiesLoading } = useDistinctCities();
  const {
    distinctCountries,
    distinctCountriesLoading,
  } = useDistinctCountries();

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  }

  const _handleFinish = (values: VisitorNewFormValues) => {
      const { cnicNumber, contactNumber1 } = values;
      if (!cnicNumber && !contactNumber1) {
        form.setFields([
          { name: 'cnicNumber', errors: ['Please input the CNIC or Mobile Number for the person'] },
          { name: 'contactNumber1', errors: ['Please input the CNIC or Mobile Number for the person'] },
        ]);
      } else {
        handleFinish(values);
      }
  };

  if (distinctCitiesLoading || distinctCountriesLoading) return null;

  return (
    <Form form={form} layout="horizontal" onFinish={_handleFinish} onFieldsChange={handleFieldsChange}>
      <InputTextField
        fieldName="name"
        fieldLabel="Name"
        required
        requiredMessage="Please input the name for the person."
      />

      <InputTextField
        fieldName="parentName"
        fieldLabel="S/O"
        required
        requiredMessage="Please input the parent name for the person."
      />

      <AgeField
        fieldName="birthDate"
        fieldLabel="Age (years)"
      />

      <AutoCompleteField
        fieldName="city"
        fieldLabel="City"
        dataSource={distinctCities ?? []}
        required
        requiredMessage="Please input the city for the person."
      />

      <AutoCompleteField
        fieldName="country"
        fieldLabel="Country"
        dataSource={distinctCountries ?? []}
        initialValue="Pakistan"
        required
        requiredMessage="Please input the country for the person."
      />

      <InputTextAreaField
        fieldName="currentAddress"
        fieldLabel="Current Address"
        required={false}
      />

      <InputTextAreaField
        fieldName="permanentAddress"
        fieldLabel="Permanent Address"
        required={false}
      />

      <Divider />

      <EhadDurationField
        fieldName="ehadDate"
        fieldLabel="Ehad Duration"
        required
        requiredMessage="Please specify the Ehad duration for the person."
      />

      <InputTextField
        fieldName="referenceName"
        fieldLabel="R/O"
        required
        requiredMessage="Please input the reference name for the person."
      />

      <InputCnicField
        fieldName="cnicNumber"
        fieldLabel="CNIC Number"
      />

      <InputMobileField
        fieldName="contactNumber1"
        fieldLabel="Mobile Number"
      />

      <InputTextField
        fieldName="contactNumber2"
        fieldLabel="Home Number"
        required={false}
      />

      <Divider />

      <InputTextField
        fieldName="educationalQualification"
        fieldLabel="Education"
        required={false}
      />

      <InputTextAreaField
        fieldName="meansOfEarning"
        fieldLabel="Means of Earning"
        required={false}
      />

      <FormButtonsSaveCancel
        handleCancel={handleCancel}
        isFieldsTouched={isFieldsTouched}
      />
    </Form>
  );
};

export default NewForm;
