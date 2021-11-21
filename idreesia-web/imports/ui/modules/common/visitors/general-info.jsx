import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

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
import { AuditInfo } from '/imports/ui/modules/common';

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
    <>
      <Form layout="horizontal" onSubmit={_handleSubmit}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          required
          requiredMessage="Please input the name for the person."
          initialValue={visitor.name}
        />

        <InputTextField
          fieldName="parentName"
          fieldLabel="S/O"
          required
          requiredMessage="Please input the parent name for the person."
          initialValue={visitor.parentName}
        />

        <AgeField
          fieldName="birthDate"
          fieldLabel="Age (years)"
          initialValue={
            visitor.birthDate ? moment(Number(visitor.birthDate)) : null
          }
        />

        <AutoCompleteField
          fieldName="city"
          fieldLabel="City"
          dataSource={distinctCities}
          required
          requiredMessage="Please input the city for the person."
          initialValue={visitor.city}
        />

        <AutoCompleteField
          fieldName="country"
          fieldLabel="Country"
          dataSource={distinctCountries}
          required
          requiredMessage="Please input the country for the person."
          initialValue={visitor.country}
        />

        <InputTextAreaField
          fieldName="currentAddress"
          fieldLabel="Current Address"
          required={false}
          initialValue={visitor.currentAddress}
        />

        <InputTextAreaField
          fieldName="permanentAddress"
          fieldLabel="Permanent Address"
          required={false}
          initialValue={visitor.permanentAddress}
        />

        <Divider />

        <EhadDurationField
          fieldName="ehadDate"
          fieldLabel="Ehad Duration"
          required
          requiredMessage="Please specify the Ehad duration for the person."
          initialValue={moment(Number(visitor.ehadDate))}
        />

        <InputTextField
          fieldName="referenceName"
          fieldLabel="R/O"
          required
          requiredMessage="Please input the reference name for the person."
          initialValue={visitor.referenceName}
        />

        <InputCnicField
          fieldName="cnicNumber"
          fieldLabel="CNIC Number"
          initialValue={visitor.cnicNumber}
        />

        <InputMobileField
          fieldName="contactNumber1"
          fieldLabel="Mobile Number"
          initialValue={visitor.contactNumber1}
        />

        <InputTextField
          fieldName="contactNumber2"
          fieldLabel="Home Number"
          initialValue={visitor.contactNumber2}
        />

        <Divider />

        <InputTextField
          fieldName="educationalQualification"
          fieldLabel="Education"
          initialValue={visitor.educationalQualification}
          required={false}
        />

        <InputTextAreaField
          fieldName="meansOfEarning"
          fieldLabel="Means of Earning"
          initialValue={visitor.meansOfEarning}
          required={false}
        />

        <FormButtonsSaveCancel
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
      <AuditInfo record={visitor} />
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
