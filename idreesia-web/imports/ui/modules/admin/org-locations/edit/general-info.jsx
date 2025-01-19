import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@apollo/react-hooks';
import { Form, message } from 'antd';

import { OrgLocationTypes } from 'meteor/idreesia-common/constants';

import {
  InputTextField,
  InputTextAreaField,
  SwitchField,
  FormButtonsSubmit,
} from '/imports/ui/modules/helpers/fields';

import { UPDATE_ORG_LOCATION } from '../gql';

export const GeneralInfo = ({ orgLocation, handleSave }) => {
  const [form] = Form.useForm();
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [updateOrgLocation] = useMutation(UPDATE_ORG_LOCATION);

  useEffect(() => {
    setIsFieldsTouched(false);
    if (orgLocation?.type === OrgLocationTypes.MEHFIL) {
      const { mehfilDetails } = orgLocation;
      form.setFieldsValue({
        name: orgLocation.name,
        address: mehfilDetails.address,
        mehfilStartYear: mehfilDetails.mehfilStartYear,
        timingDetails: mehfilDetails.timingDetails,
        lcdAvailability: mehfilDetails.lcdAvailability,
        tabAvailability: mehfilDetails.tabAvailability,
        otherMehfilDetails: mehfilDetails.otherMehfilDetails,
      });
    } else {
      form.setFieldsValue({
        name: orgLocation.name,
      });
    }
  }, [orgLocation]);

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  }

  const handleFinish = ({
    name,
    address,
    mehfilStartYear,
    timingDetails,
    lcdAvailability,
    tabAvailability,
    otherMehfilDetails,
  }) => {
    handleSave({
      _id: orgLocation._id,
      name,
      address,
      mehfilStartYear,
      timingDetails,
      lcdAvailability,
      tabAvailability,
      otherMehfilDetails,
    });
  };

  return (
    <Form 
      form={form}
      layout="horizontal"
      onFinish={handleFinish}
      onFieldsChange={handleFieldsChange}
    >
      { orgLocation.type === 'Mehfil' ? (
        <>
          <InputTextField
            fieldName="name"
            fieldLabel="Mehfil Name"
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
        </>
      ) : (
        <>
          <InputTextField
            fieldName="name"
            fieldLabel={`${orgLocation.type} Name`}
            required
            requiredMessage="Please input a name for the location."
          />
        </>
      )}
      <FormButtonsSubmit
        text="Save"
        isFieldsTouched={isFieldsTouched}
      />
    </Form>
  );
}

GeneralInfo.propTypes = {
  orgLocation: PropTypes.object,
  handleSave: PropTypes.func,
};
