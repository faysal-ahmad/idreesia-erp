import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Form, message } from 'antd';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { InventorySubModulePaths as paths } from '/imports/ui/modules/inventory';
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

const AntForm = Form as any;
const TextField = InputTextField as any;
const TextAreaField = InputTextAreaField as any;
const TreeField = TreeSelectField as any;
const SaveCancelButtons = FormButtonsSaveCancel as any;

interface RouteParams {
  physicalStoreId: string;
}

interface HistoryLike {
  goBack(): void;
  push(path: string): void;
}

interface NewFormProps {
  history: HistoryLike;
}

interface LocationRecord {
  _id: string;
  name: string;
  parentId?: string | null;
  description?: string;
}

interface LocationsData {
  locationsByPhysicalStoreId: LocationRecord[];
}

interface LocationFormValues {
  name: string;
  parentId?: string | null;
  description?: string;
}

const NewForm = ({ history }: NewFormProps) => {
  const dispatch = useDispatch();
  const { physicalStoreId } = useParams<RouteParams>();
  const { physicalStore } = usePhysicalStore(physicalStoreId);
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [createLocation] = useMutation(CREATE_LOCATION as any, {
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
        setBreadcrumbs(['Inventory', physicalStore.name, 'Setup', 'Locations', 'New'])
      );
    } else {
      dispatch(setBreadcrumbs(['Inventory', 'Setup', 'Locations', 'New']));
    }
  }, [dispatch, physicalStore]);

  const { data: locationsData, loading: locationsDataLoading } = useQuery(
    LOCATIONS_BY_PHYSICAL_STORE_ID as any,
    {
      variables: { physicalStoreId },
    }
  );

  if (locationsDataLoading) return null;
  const { locationsByPhysicalStoreId } = (locationsData as LocationsData) ?? {
    locationsByPhysicalStoreId: [],
  };

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
    createLocation({
      variables: { name, physicalStoreId, parentId, description },
    })
      .then(() => {
        message.success('New location was created successfully.', 5);
        history.push(paths.locationsPath(physicalStoreId));
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  return (
    <AntForm
      layout="horizontal"
      onFinish={handleFinish}
      onFieldsChange={handleFieldsChange}
    >
      <TextField
        fieldName="name"
        fieldLabel="Name"
        required
        requiredMessage="Please input a name for the location."
      />
      <TreeField
        data={locationsByPhysicalStoreId}
        fieldName="parentId"
        fieldLabel="Parent Location"
      />
      <TextAreaField
        fieldName="description"
        fieldLabel="Description"
      />
      <SaveCancelButtons
        handleCancel={handleCancel}
        isFieldsTouched={isFieldsTouched}
      />
    </AntForm>
  );
};

NewForm.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default NewForm;
