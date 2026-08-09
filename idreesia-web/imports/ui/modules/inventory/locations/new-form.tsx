import React, { useState } from 'react';
import { Form } from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { type History } from 'history';

import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
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

interface NewFormProps {
  history: History;
}

interface LocationFormValues {
  name: string;
  parentId?: string | null;
  description?: string;
}

const NewForm = ({ history }: NewFormProps) => {
  const { physicalStoreId } = useParams<{ physicalStoreId: string }>();
  const { physicalStore } = usePhysicalStore(physicalStoreId!);
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [createLocation] = useMutation(CREATE_LOCATION, {
    refetchQueries: [{
      query: LOCATIONS_BY_PHYSICAL_STORE_ID,
      variables: {
        physicalStoreId,
      },
    }],
  });

  useDynamicBreadcrumbs(
    physicalStore
      ? ['Inventory', physicalStore.name ?? '', 'Setup', 'Locations', 'New']
      : ['Inventory', 'Setup', 'Locations', 'New']
  );

  const { data: locationsData, loading: locationsDataLoading } = useQuery(
    LOCATIONS_BY_PHYSICAL_STORE_ID,
    {
      variables: { physicalStoreId: physicalStoreId! },
    }
  );

  if (locationsDataLoading) return null;
  const locationsByPhysicalStoreId = (
    locationsData?.locationsByPhysicalStoreId ?? []
  ).filter((row) => row != null);

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
      variables: { name, physicalStoreId: physicalStoreId!, parentId, description },
    })
      .then(() => {
        message.success('New location was created successfully.', 5);
        history.push(paths.locationsPath(physicalStoreId!));
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  return (
    <Form
      layout="horizontal"
      onFinish={handleFinish}
      onFieldsChange={handleFieldsChange}
    >
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
};

export default NewForm;
