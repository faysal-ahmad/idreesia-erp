import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Form, message } from 'antd';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';

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

const AntForm = Form as any;
const TextField = InputTextField as any;
const TextAreaField = InputTextAreaField as any;
const TreeField = TreeSelectField as any;
const SaveCancelButtons = FormButtonsSaveCancel as any;
const AuditInfoComponent = AuditInfo as any;

interface RouteParams {
  physicalStoreId: string;
  locationId: string;
}

interface HistoryLike {
  goBack(): void;
}

interface EditFormProps {
  history: HistoryLike;
}

interface LocationRecord {
  _id: string;
  name: string;
  parentId?: string | null;
  description?: string;
}

interface LocationData {
  locationById: LocationRecord;
}

interface LocationsData {
  locationsByPhysicalStoreId: LocationRecord[];
}

interface LocationFormValues {
  name: string;
  parentId?: string | null;
  description?: string;
}

const EditForm = ({ history }: EditFormProps) => {
  const dispatch = useDispatch();
  const { physicalStoreId, locationId } = useParams<RouteParams>();
  const { physicalStore } = usePhysicalStore(physicalStoreId);
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [updateLocation] = useMutation(UPDATE_LOCATION as any, {
    refetchQueries: [{
      query: LOCATIONS_BY_PHYSICAL_STORE_ID as any,
      variables: {
        physicalStoreId,
      },
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
  }, [dispatch, physicalStore]);

  const { data, loading } = useQuery(LOCATION_BY_ID as any, {
    variables: { _id: locationId, physicalStoreId },
  });

  const { data: locationsData, loading: locationsDataLoading } = useQuery(
    LOCATIONS_BY_PHYSICAL_STORE_ID as any,
    {
      variables: { physicalStoreId },
    }
  );

  if (loading || locationsDataLoading) return null;
  const { locationById } = (data as LocationData) ?? {};
  const { locationsByPhysicalStoreId } = (locationsData as LocationsData) ?? {
    locationsByPhysicalStoreId: [],
  };
  if (!locationById) return null;

  const handleCancel = () => {
    history.goBack();
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({
    name,
    parentId,
    description,
  }: LocationFormValues) => {
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
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  return (
    <>
      <AntForm
        layout="horizontal"
        onFinish={handleFinish}
        onFieldsChange={handleFieldsChange}
      >
        <TextField
          fieldName="name"
          fieldLabel="Name"
          initialValue={locationById.name}
          required
          requiredMessage="Please input a name for the location."
        />
        <TreeField
          data={locationsByPhysicalStoreId}
          skipValue={locationById._id}
          fieldName="parentId"
          fieldLabel="Parent Location"
          initialValue={locationById.parentId}
        />
        <TextAreaField
          fieldName="description"
          fieldLabel="Description"
          initialValue={locationById.description}
        />
        <SaveCancelButtons
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </AntForm>
      <AuditInfoComponent record={locationById} />
    </>
  );
};

EditForm.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default EditForm;
