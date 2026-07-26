// @ts-nocheck
import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@apollo/client/react';
import { Divider, Form, message } from 'antd';

import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';
import {
  AgeField,
  EhadDurationField,
  InputCnicField,
  InputMobileField,
  InputTextField,
  SelectField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

import { CREATE_HR_KARKUN } from '../gql';

const NewForm = ({ history }) => {
  const formRef = useRef();
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [createHrKarkun] = useMutation(CREATE_HR_KARKUN, {
    refetchQueries: ['pagedHrKarkuns'],
  });

  const handleCancel = () => {
    history.goBack();
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({
    name,
    parentName,
    cnicNumber,
    contactNumber1,
    contactNumber2,
    emailAddress,
    currentAddress,
    permanentAddress,
    bloodGroup,
    educationalQualification,
    meansOfEarning,
    ehadDate,
    birthDate,
    referenceName,
  }) => {
    if (!cnicNumber && !contactNumber1) {
      formRef.current.setFields([
        {
          name: "cnicNumber",
          errors: ['Please input the CNIC or Mobile Number for the person'],
        },
        {
          name: "contactNumber1",
          errors: ['Please input the CNIC or Mobile Number for the person'],
        },
      ]);
    } else {
      createHrKarkun({
        variables: {
          name,
          parentName,
          cnicNumber,
          contactNumber1,
          contactNumber2,
          emailAddress,
          currentAddress,
          permanentAddress,
          bloodGroup,
          educationalQualification,
          meansOfEarning,
          ehadDate,
          birthDate,
          referenceName,
        },
      })
        .then(({ data: { createHrKarkun: newKarkun } }) => {
          history.push(`${paths.karkunsPath}/${newKarkun._id}`);
        })
        .catch(error => {
          message.error(error.message, 5);
        });
    }
  };

  return (
    <Form ref={formRef} layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
      <InputTextField
        fieldName="name"
        fieldLabel="Name"
        required
        requiredMessage="Please input the name for the karkun."
      />

      <InputTextField
        fieldName="parentName"
        fieldLabel="S/O"
        required
        requiredMessage="Please input the parent name for the karkun."
      />

      <AgeField
        fieldName="birthDate"
        fieldLabel="Age (years)"
      />

      <EhadDurationField
        fieldName="ehadDate"
        fieldLabel="Ehad Duration"
        required
        requiredMessage="Please specify the Ehad duration for the karkun."
      />

      <InputTextField
        fieldName="referenceName"
        fieldLabel="R/O"
        required
        requiredMessage="Please input the reference name for the karkun."
      />

      <InputCnicField
        fieldName="cnicNumber"
        fieldLabel="CNIC Number"
      />

      <InputMobileField
        fieldName="contactNumber1"
        fieldLabel="Mobile Number"
      />

      <Divider />

      <InputTextField
        fieldName="contactNumber2"
        fieldLabel="Home Number"
        required={false}
      />

      <SelectField
        fieldName="bloodGroup"
        fieldLabel="Blood Group"
        required={false}
        data={[
          { label: 'A-', value: 'A-' },
          { label: 'A+', value: 'A+' },
          { label: 'B-', value: 'B-' },
          { label: 'B+', value: 'B+' },
          { label: 'AB-', value: 'AB-' },
          { label: 'AB+', value: 'AB+' },
          { label: 'O-', value: 'O-' },
          { label: 'O+', value: 'O+' },
        ]}
        getDataValue={({ value }) => value}
        getDataText={({ label }) => label}
      />

      <InputTextField
        fieldName="emailAddress"
        fieldLabel="Email"
        required={false}
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
};

export default WithBreadcrumbs(['HR', 'Karkuns', 'New'])(NewForm);
