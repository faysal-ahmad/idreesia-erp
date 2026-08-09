import React, { useState } from 'react';
import { type RouteComponentProps } from 'react-router';
import { useMutation, useQuery } from '@apollo/client/react';
import { Form } from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';
import {
  InputTextField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

import {
  ADMIN_PHYSICAL_STORE_BY_ID,
  UPDATE_PHYSICAL_STORE,
} from './gql';

interface FormValues {
  name: string;
  address?: string;
}

type Props = RouteComponentProps<{ physicalStoreId: string }>;

const EditForm = ({ match, history }: Props) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const { physicalStoreId } = match.params;
  useBreadcrumbs(['Admin', 'Setup', 'Physical Stores', 'Edit']);
  const { data, loading } = useQuery(ADMIN_PHYSICAL_STORE_BY_ID, {
    variables: { id: physicalStoreId },
  });
  const [updatePhysicalStore] = useMutation(UPDATE_PHYSICAL_STORE, {
    refetchQueries: ['allPhysicalStores', 'allAccessiblePhysicalStores'],
  });
  const physicalStoreById = data?.physicalStoreById;

  const handleCancel = () => {
    history.push(paths.physicalStoresPath);
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = (fieldsValue: FormValues) => {
    updatePhysicalStore({
      variables: {
        id: physicalStoreId,
        name: fieldsValue.name,
        address: fieldsValue.address ?? '',
      },
    })
      .then(() => {
        history.push(paths.physicalStoresPath);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  if (loading) return null;

  return (
    <Form layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
      <InputTextField
        fieldName="name"
        fieldLabel="Name"
        initialValue={physicalStoreById?.name}
        required
        requiredMessage="Please input a name for the physical store."
      />
      <InputTextAreaField
        fieldName="address"
        fieldLabel="Address"
        initialValue={physicalStoreById?.address}
        required={false}
      />
      <FormButtonsSaveCancel
        handleCancel={handleCancel}
        isFieldsTouched={isFieldsTouched}
      />
    </Form>
  );
};

export default EditForm;
