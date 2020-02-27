import React from 'react';
import PropTypes from 'prop-types';

import {
  useDistinctCities,
  useDistinctCountries,
} from 'meteor/idreesia-common/hooks/security';
import { Divider, Form } from '/imports/ui/controls';
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
  const { getFieldDecorator } = form;

  return (
    <Form layout="horizontal" onSubmit={_handleSubmit}>
      <InputTextField
        fieldName="name"
        fieldLabel="Name"
        required
        requiredMessage="Please input the name for the person."
        getFieldDecorator={getFieldDecorator}
      />

      <InputTextField
        fieldName="parentName"
        fieldLabel="S/O"
        required
        requiredMessage="Please input the parent name for the person."
        getFieldDecorator={getFieldDecorator}
      />

      <AgeField
        fieldName="birthDate"
        fieldLabel="Age (years)"
        getFieldDecorator={getFieldDecorator}
      />

      <AutoCompleteField
        fieldName="city"
        fieldLabel="City"
        dataSource={distinctCities}
        required
        requiredMessage="Please input the city for the person."
        getFieldDecorator={getFieldDecorator}
      />

      <AutoCompleteField
        fieldName="country"
        fieldLabel="Country"
        dataSource={distinctCountries}
        initialValue="Pakistan"
        required
        requiredMessage="Please input the country for the person."
        getFieldDecorator={getFieldDecorator}
      />

      <InputTextAreaField
        fieldName="address"
        fieldLabel="Address"
        required={false}
        getFieldDecorator={getFieldDecorator}
      />

      <Divider />

      <EhadDurationField
        fieldName="ehadDate"
        fieldLabel="Ehad Duration"
        required
        requiredMessage="Please specify the Ehad duration for the person."
        getFieldDecorator={getFieldDecorator}
      />

      <InputTextField
        fieldName="referenceName"
        fieldLabel="R/O"
        required
        requiredMessage="Please input the reference name for the person."
        getFieldDecorator={getFieldDecorator}
      />

      <InputCnicField
        fieldName="cnicNumber"
        fieldLabel="CNIC Number"
        getFieldDecorator={getFieldDecorator}
      />

      <InputMobileField
        fieldName="contactNumber1"
        fieldLabel="Mobile Number"
        getFieldDecorator={getFieldDecorator}
      />

      <InputTextField
        fieldName="contactNumber2"
        fieldLabel="Home Number"
        required={false}
        getFieldDecorator={getFieldDecorator}
      />

      <FormButtonsSaveCancel handleCancel={handleCancel} />
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

export default Form.create()(NewForm);
