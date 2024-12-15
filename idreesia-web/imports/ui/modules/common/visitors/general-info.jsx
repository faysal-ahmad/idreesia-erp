import React, { useState } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
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
import { AuditInfo } from '/imports/ui/modules/common';

const GeneralInfo = ({ visitor, handleFinish, handleCancel }) => {
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

  const _handleFinish = values => {
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
    <>
      <Form form={form} layout="horizontal" onFinish={_handleFinish} onFieldsChange={handleFieldsChange}>
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
            visitor.birthDate ? dayjs(Number(visitor.birthDate)) : null
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
          initialValue={dayjs(Number(visitor.ehadDate))}
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
  visitor: PropTypes.object,
  handleFinish: PropTypes.func,
  handleCancel: PropTypes.func,
};

export default GeneralInfo;
