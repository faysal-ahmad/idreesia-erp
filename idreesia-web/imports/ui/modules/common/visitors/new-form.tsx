import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Divider, Form } from 'antd';

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

const AntDivider = Divider as any;
const AntForm = Form as any;
const AgeInputField = AgeField as any;
const AutoCompleteInputField = AutoCompleteField as any;
const EhadDurationInputField = EhadDurationField as any;
const CnicField = InputCnicField as any;
const MobileField = InputMobileField as any;
const TextField = InputTextField as any;
const TextAreaField = InputTextAreaField as any;
const SaveCancelButtons = FormButtonsSaveCancel as any;
type AnyRecord = Record<string, any>;
interface Props { visitor?: AnyRecord; handleFinish(values: AnyRecord): void; handleCancel?(): void; }

const NewForm = ({ handleFinish, handleCancel }: Props) => {
  const [form] = AntForm.useForm();
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const { distinctCities, distinctCitiesLoading } = useDistinctCities();
  const {
    distinctCountries,
    distinctCountriesLoading,
  } = useDistinctCountries();

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  }

  const _handleFinish = (values: AnyRecord) => {
      const { cnicNumber, contactNumber1 } = values;
      if (!cnicNumber && !contactNumber1) {
        form.setFields({
          cnicNumber: {
            errors: [
              new Error(
                'Please input the CNIC or Mobile Number for the person'
              ),
            ],
          },
          contactNumber1: {
            errors: [
              new Error(
                'Please input the CNIC or Mobile Number for the person'
              ),
            ],
          },
        });
      } else {
        handleFinish(values);
      }
  };

  if (distinctCitiesLoading || distinctCountriesLoading) return null;

  return (
    <AntForm form={form} layout="horizontal" onFinish={_handleFinish}  onFieldsChange={handleFieldsChange}>
      <TextField
        fieldName="name"
        fieldLabel="Name"
        required
        requiredMessage="Please input the name for the person."
      />

      <TextField
        fieldName="parentName"
        fieldLabel="S/O"
        required
        requiredMessage="Please input the parent name for the person."
      />

      <AgeInputField
        fieldName="birthDate"
        fieldLabel="Age (years)"
      />

      <AutoCompleteInputField
        fieldName="city"
        fieldLabel="City"
        dataSource={distinctCities}
        required
        requiredMessage="Please input the city for the person."
      />

      <AutoCompleteInputField
        fieldName="country"
        fieldLabel="Country"
        dataSource={distinctCountries}
        initialValue="Pakistan"
        required
        requiredMessage="Please input the country for the person."
      />

      <TextAreaField
        fieldName="currentAddress"
        fieldLabel="Current Address"
        required={false}
      />

      <TextAreaField
        fieldName="permanentAddress"
        fieldLabel="Permanent Address"
        required={false}
      />

      <AntDivider />

      <EhadDurationInputField
        fieldName="ehadDate"
        fieldLabel="Ehad Duration"
        required
        requiredMessage="Please specify the Ehad duration for the person."
      />

      <TextField
        fieldName="referenceName"
        fieldLabel="R/O"
        required
        requiredMessage="Please input the reference name for the person."
      />

      <CnicField
        fieldName="cnicNumber"
        fieldLabel="CNIC Number"
      />

      <MobileField
        fieldName="contactNumber1"
        fieldLabel="Mobile Number"
      />

      <TextField
        fieldName="contactNumber2"
        fieldLabel="Home Number"
        required={false}
      />

      <AntDivider />

      <TextField
        fieldName="educationalQualification"
        fieldLabel="Education"
        required={false}
      />

      <TextAreaField
        fieldName="meansOfEarning"
        fieldLabel="Means of Earning"
        required={false}
      />

      <SaveCancelButtons
        handleCancel={handleCancel}
        isFieldsTouched={isFieldsTouched}
      />
    </AntForm>
  );
};

NewForm.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
  handleFinish: PropTypes.func,
  handleCancel: PropTypes.func,
};

export default NewForm;
