import React from 'react';
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

const NewForm = ({ form, handleSubmit, handleCancel }) => {
  const { distinctCities, distinctCitiesLoading } = useDistinctCities();
  const {
    distinctCountries,
    distinctCountriesLoading,
  } = useDistinctCountries();

  const _handleSubmit = e => {
    e.preventDefault();
    form.validateFields((err, values) => {
      if (err) return;
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
        handleSubmit(values);
      }
    });
  };

  if (distinctCitiesLoading || distinctCountriesLoading) return null;
  const { isFieldsTouched } = form;

  return (
    <Form layout="horizontal" onSubmit={_handleSubmit}>
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
        dataSource={distinctCities}
        required
        requiredMessage="Please input the city for the person."
      />

      <AutoCompleteField
        fieldName="country"
        fieldLabel="Country"
        dataSource={distinctCountries}
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

NewForm.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
  form: PropTypes.object,
  handleSubmit: PropTypes.func,
  handleCancel: PropTypes.func,
};

export default NewForm;
