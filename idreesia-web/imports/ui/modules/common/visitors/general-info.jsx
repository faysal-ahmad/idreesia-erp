import React from 'react';
import PropTypes from 'prop-types';

import {
  useDistinctCities,
  useDistinctCountries,
} from 'meteor/idreesia-common/hooks/security';
import { Divider, Form } from '/imports/ui/controls';
import {
  AutoCompleteField,
  EhadDurationField,
  InputCnicField,
  InputMobileField,
  InputTextField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { RecordInfo } from '/imports/ui/modules/helpers/controls';

const GeneralInfo = ({ visitor, form, handleSubmit, handleCancel }) => {
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
                'Please input the CNIC or Mobile Number for the visitor'
              ),
            ],
          },
          contactNumber1: {
            errors: [
              new Error(
                'Please input the CNIC or Mobile Number for the visitor'
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
    <>
      <Form layout="horizontal" onSubmit={_handleSubmit}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          required
          requiredMessage="Please input the name for the visitor."
          initialValue={visitor.name}
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="parentName"
          fieldLabel="S/O"
          required
          requiredMessage="Please input the parent name for the visitor."
          initialValue={visitor.parentName}
          getFieldDecorator={getFieldDecorator}
        />

        <AutoCompleteField
          fieldName="city"
          fieldLabel="City"
          dataSource={distinctCities}
          required
          requiredMessage="Please input the city for the visitor."
          initialValue={visitor.city}
          getFieldDecorator={getFieldDecorator}
        />

        <AutoCompleteField
          fieldName="country"
          fieldLabel="Country"
          dataSource={distinctCountries}
          required
          requiredMessage="Please input the country for the visitor."
          initialValue={visitor.country}
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextAreaField
          fieldName="address"
          fieldLabel="Address"
          required={false}
          initialValue={visitor.address}
          getFieldDecorator={getFieldDecorator}
        />

        <Divider />

        <EhadDurationField
          fieldName="ehadDate"
          fieldLabel="Ehad Duration"
          required
          requiredMessage="Please specify the Ehad duration for the visitor."
          initialValue={visitor.ehadDate}
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="referenceName"
          fieldLabel="R/O"
          required
          requiredMessage="Please input the reference name for the visitor."
          initialValue={visitor.referenceName}
          getFieldDecorator={getFieldDecorator}
        />

        <InputCnicField
          fieldName="cnicNumber"
          fieldLabel="CNIC Number"
          initialValue={visitor.cnicNumber}
          getFieldDecorator={getFieldDecorator}
        />

        <InputMobileField
          fieldName="contactNumber1"
          fieldLabel="Mobile Number"
          initialValue={visitor.contactNumber1}
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="contactNumber2"
          fieldLabel="Home Number"
          initialValue={visitor.contactNumber2}
          getFieldDecorator={getFieldDecorator}
        />

        <FormButtonsSaveCancel handleCancel={handleCancel} />
      </Form>
      <RecordInfo record={visitor} />
    </>
  );
};

GeneralInfo.propTypes = {
  form: PropTypes.object,
  visitor: PropTypes.object,
  handleSubmit: PropTypes.func,
  handleCancel: PropTypes.func,
};

export default Form.create()(GeneralInfo);
