import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Form, message } from 'antd';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useMutation } from '@apollo/react-hooks';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import {
  InputTextField,
  InputTextAreaField,
  TreeSelectField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { usePhysicalStore } from '/imports/ui/modules/inventory/common/hooks';

import {
  CREATE_LOCATION,
  LOCATIONS_BY_PHYSICAL_STORE_ID,
} from './gql';

const NewForm = ({ history }) => {
  const dispatch = useDispatch();
  const { physicalStoreId } = useParams();
  const { physicalStore } = usePhysicalStore(physicalStoreId);
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [createLocation] = useMutation(CREATE_LOCATION, {
    refetchQueries: [{ 
      query: LOCATIONS_BY_PHYSICAL_STORE_ID,
      variables: {
        physicalStoreId,
      }
    }],
  });

  useEffect(() => {
    if (physicalStore) {
      dispatch(
        setBreadcrumbs(['Inventory', physicalStore.name, 'Setup', 'Locations', 'New'])
      );
    } else {
      dispatch(setBreadcrumbs(['Inventory', 'Setup', 'Locations', 'New']));
    }
  }, [physicalStoreId]);

  const handleCancel = () => {
    history.goBack();
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  }

  const handleFinish = ({ name, parentId, description }) => {
    createLocation({
      variables: { name, physicalStoreId, parentId, description },
    })
      .then(() => {
        message.success('New location was created successfully.', 5);
        history.push(paths.locationsPath(physicalStoreId));
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
        requiredMessage="Please input a name for the location."
      />
      <TreeSelectField
        data={locationsByPhysicalStoreId}
        fieldName="parentId"
        fieldLabel="Parent Location"
      />
      <InputTextAreaField
        fieldName="description"
        fieldLabel="Description"
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
