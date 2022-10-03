import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Form, message } from 'antd';
import { useDispatch } from 'react-redux';
import { useMutation } from '@apollo/react-hooks';

import {
  InputTextField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';

import { CREATE_WAZAIF_VENDOR } from './gql';

const NewForm = ({ history }) => {
  const dispatch = useDispatch();
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [createWazaifVendor] = useMutation(CREATE_WAZAIF_VENDOR);

  useEffect(() => {
    dispatch(setBreadcrumbs(['Operations', 'Wazaif Management', 'Setup', 'New Vendor']));
  }, []);

  const handleCancel = () => {
    history.goBack();
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  }

  const handleFinish = ({ name, contactPerson, contactNumber, address, notes }) => {
    createWazaifVendor({
      variables: {
        name,
        contactPerson,
        contactNumber,
        address,
        notes,
      },
    })
      .then(() => {
        history.goBack();
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  return (
    <Form layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
      <InputTextField
        fieldName="name"
        fieldLabel="Name"
        required
        requiredMessage="Please input a name for the vendor."
      />
      <InputTextField
        fieldName="contactPerson"
        fieldLabel="Contact Person"
      />
      <InputTextField
        fieldName="contactNumber"
        fieldLabel="Contact Number"
      />
      <InputTextAreaField
        fieldName="address"
        fieldLabel="Address"
      />
      <InputTextAreaField
        fieldName="notes"
        fieldLabel="Notes"
      />
      <FormButtonsSaveCancel
        handleCancel={handleCancel}
        isFieldsTouched={isFieldsTouched}
      />
    </Form>
  );
}

NewForm.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default NewForm;
