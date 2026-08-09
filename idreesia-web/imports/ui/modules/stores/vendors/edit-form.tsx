import React, { useState } from 'react';
import { Form } from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { type History } from 'history';

import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import { ModuleNames } from 'meteor/idreesia-common/constants';
import AuditInfo from '/imports/ui/modules/common/audit-info/audit-info';
import {
  InputTextField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { usePhysicalStore } from '/imports/ui/modules/stores/common/hooks';

import {
  VENDOR_BY_ID,
  VENDORS_BY_PHYSICAL_STORE_ID,
  UPDATE_VENDOR,
} from './gql';

interface EditFormProps {
  history: History;
}

interface VendorFormValues {
  name: string;
  contactPerson?: string;
  contactNumber?: string;
  address?: string;
  notes?: string;
}

const EditForm = ({ history }: EditFormProps) => {
  const { physicalStoreId, vendorId } = useParams<{
    physicalStoreId: string;
    vendorId: string;
  }>();
  const { physicalStore } = usePhysicalStore(physicalStoreId!);
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [updateVendor] = useMutation(UPDATE_VENDOR, {
    refetchQueries: [{
      query: VENDORS_BY_PHYSICAL_STORE_ID,
      variables: {
        physicalStoreId,
      },
    }],
  });

  useDynamicBreadcrumbs(
    physicalStore
      ? [ModuleNames.stores, physicalStore.name ?? '', 'Setup', 'Vendors', 'Edit']
      : [ModuleNames.stores, 'Setup', 'Vendors', 'Edit']
  );

  const { data, loading } = useQuery(VENDOR_BY_ID, {
    variables: { _id: vendorId!, physicalStoreId: physicalStoreId! },
  });

  if (loading) return null;
  const vendorById = data?.vendorById;
  if (!vendorById) return null;

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
    updateVendor({
      variables: {
        _id: vendorById._id!,
        physicalStoreId: physicalStoreId!,
        name,
        contactPerson,
        contactNumber,
        address,
        notes,
      },
    })
      .then(() => {
        message.success('Vendor was updated successfully.', 5);
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
          initialValue={vendorById.name ?? undefined}
          required
          requiredMessage="Please input a name for the vendor."
        />
        <InputTextField
          fieldName="contactPerson"
          fieldLabel="Contact Person"
          initialValue={vendorById.contactPerson ?? undefined}
        />
        <InputTextField
          fieldName="contactNumber"
          fieldLabel="Contact Number"
          initialValue={vendorById.contactNumber ?? undefined}
        />
        <InputTextAreaField
          fieldName="address"
          fieldLabel="Address"
          initialValue={vendorById.address ?? undefined}
        />
        <InputTextAreaField
          fieldName="notes"
          fieldLabel="Notes"
          initialValue={vendorById.notes ?? undefined}
        />
        <FormButtonsSaveCancel
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
      <AuditInfo record={vendorById} />
    </>
  );
};

export default EditForm;
