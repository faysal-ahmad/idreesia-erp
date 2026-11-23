import React, { useState } from 'react';
import { type RouteComponentProps } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import { Collapse, Empty, Form, Spin } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import {
  FormButtonsSaveCancel,
  InputNumberField,
  InputTextAreaField,
  InputTextField,
} from '/imports/ui/modules/helpers/fields';
import AuditInfo from '/imports/ui/modules/common/audit-info/audit-info';

import { default as paths } from '../submodule-paths';
import { PURCHASING_VENDOR_BY_ID, UPDATE_PURCHASING_VENDOR } from './gql';

interface FormValues {
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxId?: string;
  paymentTermsDays?: number | null;
  bankName?: string;
  bankAccountTitle?: string;
  bankAccountNumber?: string;
  notes?: string;
}

const SECTION_KEYS = ['general', 'contact', 'payment', 'notes'];

const EditForm = ({
  match,
  history,
}: RouteComponentProps<{ vendorId: string }>) => {
  const { vendorId } = match.params;
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);

  const { data, loading } = useQuery(PURCHASING_VENDOR_BY_ID, {
    variables: { _id: vendorId },
  });
  const [updateVendor] = useMutation(UPDATE_PURCHASING_VENDOR, {
    refetchQueries: ['pagedPurchasingVendors'],
  });
  const vendor = data?.purchasingVendorById;

  useDynamicBreadcrumbs([
    'Purchasing',
    'Vendors',
    vendor?.name?.trim() || 'Edit',
  ]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!vendor?._id) {
    return <Empty description="Vendor not found" style={{ padding: '80px 0' }} />;
  }

  const handleCancel = () => {
    history.push(paths.vendorsPath);
  };

  const handleFinish = (values: FormValues) => {
    updateVendor({
      variables: {
        _id: vendor._id!,
        name: values.name,
        contactPerson: values.contactPerson,
        phone: values.phone,
        email: values.email,
        address: values.address,
        taxId: values.taxId,
        paymentTermsDays: values.paymentTermsDays ?? undefined,
        bankName: values.bankName,
        bankAccountTitle: values.bankAccountTitle,
        bankAccountNumber: values.bankAccountNumber,
        notes: values.notes,
      },
    })
      .then(() => {
        setIsFieldsTouched(false);
        message.success('Vendor saved', 2);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const items = [
    {
      key: 'general',
      label: 'General',
      forceRender: true,
      children: (
        <>
          <InputTextField
            fieldName="name"
            fieldLabel="Name"
            initialValue={vendor.name}
            required
            requiredMessage="Please input the vendor name."
          />
          <InputTextField
            fieldName="taxId"
            fieldLabel="Tax ID (NTN)"
            initialValue={vendor.taxId}
          />
        </>
      ),
    },
    {
      key: 'contact',
      label: 'Contact',
      forceRender: true,
      children: (
        <>
          <InputTextField
            fieldName="contactPerson"
            fieldLabel="Contact Person"
            initialValue={vendor.contactPerson}
          />
          <InputTextField
            fieldName="phone"
            fieldLabel="Phone"
            initialValue={vendor.phone}
          />
          <InputTextField
            fieldName="email"
            fieldLabel="Email"
            initialValue={vendor.email}
          />
          <InputTextAreaField
            fieldName="address"
            fieldLabel="Address"
            initialValue={vendor.address}
          />
        </>
      ),
    },
    {
      key: 'payment',
      label: 'Payment & Bank',
      forceRender: true,
      children: (
        <>
          <InputNumberField
            fieldName="paymentTermsDays"
            fieldLabel="Payment Terms (days)"
            initialValue={vendor.paymentTermsDays}
            minValue={0}
            precision={0}
          />
          <InputTextField
            fieldName="bankName"
            fieldLabel="Bank"
            initialValue={vendor.bankName}
          />
          <InputTextField
            fieldName="bankAccountTitle"
            fieldLabel="Account Title"
            initialValue={vendor.bankAccountTitle}
          />
          <InputTextField
            fieldName="bankAccountNumber"
            fieldLabel="Account Number"
            initialValue={vendor.bankAccountNumber}
          />
        </>
      ),
    },
    {
      key: 'notes',
      label: 'Notes',
      forceRender: true,
      children: (
        <InputTextAreaField
          fieldName="notes"
          fieldLabel="Notes"
          initialValue={vendor.notes}
        />
      ),
    },
  ];

  return (
    <div className="visitor-form">
      <Form
        layout="horizontal"
        onFinish={handleFinish}
        onFieldsChange={() => setIsFieldsTouched(true)}
      >
        <Collapse
          className="visitor-form-sections"
          defaultActiveKey={SECTION_KEYS}
          items={items}
        />
        <FormButtonsSaveCancel
          fullWidth
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
      <AuditInfo record={vendor} />
    </div>
  );
};

export default EditForm;
