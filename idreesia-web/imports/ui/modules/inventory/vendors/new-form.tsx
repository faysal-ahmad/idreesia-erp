import React, { useState } from 'react';
import { Form } from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { useParams } from 'react-router-dom';
import { useMutation } from '@apollo/client/react';
import { type History } from 'history';

import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import {
  InputTextField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { usePhysicalStore } from '/imports/ui/modules/inventory/common/hooks';

import {
  CREATE_VENDOR,
  VENDORS_BY_PHYSICAL_STORE_ID,
} from './gql';

interface NewFormProps {
  history: History;
}

interface VendorFormValues {
  name: string;
  contactPerson?: string;
  contactNumber?: string;
  address?: string;
  notes?: string;
}

const NewForm = ({ history }: NewFormProps) => {
  const { physicalStoreId } = useParams<{ physicalStoreId: string }>();
  const { physicalStore } = usePhysicalStore(physicalStoreId!);
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [createVendor] = useMutation(CREATE_VENDOR, {
    refetchQueries: [{
      query: VENDORS_BY_PHYSICAL_STORE_ID,
      variables: {
        physicalStoreId,
      },
    }],
  });

  useDynamicBreadcrumbs(
    physicalStore
      ? ['Inventory', physicalStore.name ?? '', 'Setup', 'Vendors', 'New']
      : ['Inventory', 'Setup', 'Vendors', 'New']
  );

  const handleCancel = () => {
    history.goBack();
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({
    name,
    contactPerson,
    contactNumber,
    address,
    notes,
  }: VendorFormValues) => {
    createVendor({
      variables: {
        name,
        physicalStoreId: physicalStoreId!,
        contactPerson,
        contactNumber,
        address,
        notes,
      },
    })
      .then(() => {
        message.success('New vendor was created successfully.', 5);
        history.goBack();
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
};

export default NewForm;
