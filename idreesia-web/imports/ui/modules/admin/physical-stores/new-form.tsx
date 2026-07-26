// @ts-nocheck
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/client/react';
import { Form, message } from 'antd';

import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';
import {
  InputTextField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

const formMutation = gql`
  mutation createPhysicalStore($name: String!, $address: String) {
    createPhysicalStore(name: $name, address: $address) {
      _id
      name
      address
    }
  }
`;

const NewForm = ({ history }) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [createPhysicalStore] = useMutation(formMutation, {
    refetchQueries: ['allPhysicalStores', 'allAccessiblePhysicalStores'],
  });

  const handleCancel = () => {
    history.push(paths.physicalStoresPath);
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = fieldsValue => {
    createPhysicalStore({
      variables: {
        name: fieldsValue.name,
        address: fieldsValue.address,
      },
    })
      .then(() => {
        history.push(paths.physicalStoresPath);
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
        requiredMessage="Please input a name for the physical store."
      />
      <InputTextAreaField
        fieldName="address"
        fieldLabel="Address"
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

export default WithBreadcrumbs(['Admin', 'Setup', 'Physical Stores', 'New'])(NewForm);
