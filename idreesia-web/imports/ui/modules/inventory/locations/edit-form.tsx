import React, { useState } from 'react';
import { Form } from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { type History } from 'history';

import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import AuditInfo from '/imports/ui/modules/common/audit-info/audit-info';
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

interface EditFormProps {
  history: History;
}

interface LocationFormValues {
  name: string;
  parentId?: string | null;
  description?: string;
}

const EditForm = ({ history }: EditFormProps) => {
  const { physicalStoreId, locationId } = useParams<{
    physicalStoreId: string;
    locationId: string;
  }>();
  const { physicalStore } = usePhysicalStore(physicalStoreId!);
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [updateLocation] = useMutation(UPDATE_LOCATION, {
    refetchQueries: [{
      query: LOCATIONS_BY_PHYSICAL_STORE_ID,
      variables: {
        physicalStoreId,
      },
    }],
  });

  useDynamicBreadcrumbs(
    physicalStore
      ? ['Inventory', physicalStore.name ?? '', 'Setup', 'Locations', 'Edit']
      : ['Inventory', 'Setup', 'Locations', 'Edit']
  );

  const { data, loading } = useQuery(LOCATION_BY_ID, {
    variables: { _id: locationId!, physicalStoreId: physicalStoreId! },
  });

  const { data: locationsData, loading: locationsDataLoading } = useQuery(
    LOCATIONS_BY_PHYSICAL_STORE_ID,
    {
      variables: { physicalStoreId: physicalStoreId! },
    }
  );

  if (loading || locationsDataLoading) return null;
  const locationById = data?.locationById;
  const locationsByPhysicalStoreId = (
    locationsData?.locationsByPhysicalStoreId ?? []
  ).filter((row) => row != null);
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
        _id: locationById._id!,
        physicalStoreId: physicalStoreId!,
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
      <Form
        layout="horizontal"
        onFinish={handleFinish}
        onFieldsChange={handleFieldsChange}
      >
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          initialValue={locationById.name ?? undefined}
          required
          requiredMessage="Please input a name for the location."
        />
        <TreeSelectField
          data={locationsByPhysicalStoreId}
          skipValue={locationById._id ?? undefined}
          fieldName="parentId"
          fieldLabel="Parent Location"
          initialValue={locationById.parentId ?? undefined}
        />
        <InputTextAreaField
          fieldName="description"
          fieldLabel="Description"
          initialValue={locationById.description ?? undefined}
        />
        <FormButtonsSaveCancel
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
      <AuditInfo record={locationById} />
    </>
  );
};

export default EditForm;
