import React, { useState } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useMutation, useQuery } from '@apollo/client/react';
import { Form, message } from 'antd';

import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';
import {
  InputTextField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

const formQuery = gql`
  query physicalStoreById($id: String!) {
    physicalStoreById(id: $id) {
      _id
      name
      address
    }
  }
`;

const formMutation = gql`
  mutation updatePhysicalStore(
    $id: String!
    $name: String!
    $address: String!
  ) {
    updatePhysicalStore(id: $id, name: $name, address: $address) {
      _id
      name
      address
    }
  }
`;

const EditForm = ({ match, history }) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const { physicalStoreId } = match.params;
  const { data, loading } = useQuery(formQuery, {
    variables: { id: physicalStoreId },
  });
  const [updatePhysicalStore] = useMutation(formMutation, {
    refetchQueries: ['allPhysicalStores', 'allAccessiblePhysicalStores'],
  });
  const { physicalStoreById } = data || {};

  const handleCancel = () => {
    history.push(paths.physicalStoresPath);
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = fieldsValue => {
    updatePhysicalStore({
      variables: {
        id: physicalStoreById._id,
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

  if (loading) return null;

  return (
    <Form layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
      <InputTextField
        fieldName="name"
        fieldLabel="Name"
        initialValue={physicalStoreById.name}
        required
        requiredMessage="Please input a name for the physical store."
      />
      <InputTextAreaField
        fieldName="address"
        fieldLabel="Address"
        initialValue={physicalStoreById.address}
        required={false}
      />
      <FormButtonsSaveCancel
        handleCancel={handleCancel}
        isFieldsTouched={isFieldsTouched}
      />
    </Form>
  );
};

EditForm.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default WithBreadcrumbs(['Admin', 'Setup', 'Physical Stores', 'Edit'])(EditForm);
