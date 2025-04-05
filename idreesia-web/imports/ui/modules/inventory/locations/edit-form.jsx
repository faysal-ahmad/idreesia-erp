import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Form, message } from 'antd';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/react-hooks';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { AuditInfo } from '/imports/ui/modules/common';
import {
  InputTextField,
  InputTextAreaField,
  TreeSelectField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { usePhysicalStore } from '/imports/ui/modules/inventory/common/hooks';

import {
  LOCATION_BY_ID,
  LOCATIONS_BY_PHYSICAL_STORE_ID,
  UPDATE_LOCATION,
} from './gql';

const EditForm = ({ history }) => {
  const dispatch = useDispatch();
  const { physicalStoreId, locationId } = useParams();
  const { physicalStore } = usePhysicalStore(physicalStoreId);
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [updateLocation] = useMutation(UPDATE_LOCATION, {
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
        setBreadcrumbs(['Inventory', physicalStore.name, 'Setup', 'Locations', 'Edit'])
      );
    } else {
      dispatch(setBreadcrumbs(['Inventory', 'Setup', 'Locations', 'Edit']));
    }
  }, [physicalStoreId]);

  const { data, loading } = useQuery(LOCATION_BY_ID, {
    variables: { _id: locationId, physicalStoreId }
  });

  const { data: locationsData, loading: locationsDataLoading } = useQuery(LOCATIONS_BY_PHYSICAL_STORE_ID, {
    variables: { physicalStoreId }
  });

  if (loading || locationsDataLoading) return null;
  const { locationById } = data;
  const { locationsByPhysicalStoreId } = locationsData;

  const handleCancel = () => {
    history.goBack();
  };

  handleFieldsChange = () => {
    setIsFieldsTouched(true);
  }

  const handleFinish = ({ name, parentId, description }) => {
    updateLocation({
      variables: {
        _id: locationById._id,
        physicalStoreId,
        name,
        parentId: parentId || null,
        description,
      },
    })
      .then(() => {
        message.success('Location was updated successfully.', 5);
        history.goBack();
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  return (
    <>
      <Form layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          initialValue={locationById.name}
          required
          requiredMessage="Please input a name for the location."
        />
        <TreeSelectField
          data={locationsByPhysicalStoreId}
          skipValue={locationById._id}
          fieldName="parentId"
          fieldLabel="Parent Location"
          initialValue={locationById.parentId}
        />
        <InputTextAreaField
          fieldName="description"
          fieldLabel="Description"
          initialValue={locationById.description}
        />
        <FormButtonsSaveCancel
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
      <AuditInfo record={locationById} />
    </>
  );
}

EditForm.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default EditForm;
