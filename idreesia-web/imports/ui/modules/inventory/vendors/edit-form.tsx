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
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { usePhysicalStore } from '/imports/ui/modules/inventory/common/hooks';

import {
  VENDOR_BY_ID,
  VENDORS_BY_PHYSICAL_STORE_ID,
  UPDATE_VENDOR,
} from './gql';

const AntForm = Form as any;
const TextField = InputTextField as any;
const TextAreaField = InputTextAreaField as any;
const SaveCancelButtons = FormButtonsSaveCancel as any;
const AuditInfoComponent = AuditInfo as any;

interface RouteParams {
  physicalStoreId: string;
  vendorId: string;
}

interface HistoryLike {
  goBack(): void;
}

interface EditFormProps {
  history: HistoryLike;
}

interface Vendor {
  _id: string;
  name: string;
  contactPerson?: string;
  contactNumber?: string;
  address?: string;
  notes?: string;
}

interface VendorByIdData {
  vendorById: Vendor;
}

interface VendorFormValues {
  name: string;
  contactPerson?: string;
  contactNumber?: string;
  address?: string;
  notes?: string;
}

const EditForm = ({ history }: EditFormProps) => {
  const dispatch = useDispatch();
  const { physicalStoreId, vendorId } = useParams<RouteParams>();
  const { physicalStore } = usePhysicalStore(physicalStoreId);
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [updateVendor] = useMutation(UPDATE_VENDOR as any, {
    refetchQueries: [{
      query: VENDORS_BY_PHYSICAL_STORE_ID as any,
      variables: {
        physicalStoreId,
      },
    }],
  });
  
  useEffect(() => {
    if (physicalStore) {
      dispatch(
        setBreadcrumbs(['Inventory', physicalStore.name, 'Setup', 'Vendors', 'Edit'])
      );
    } else {
      dispatch(setBreadcrumbs(['Inventory', 'Setup', 'Vendors', 'Edit']));
    }
  }, [dispatch, physicalStore]);

  const { data, loading } = useQuery(VENDOR_BY_ID as any, {
    variables: { _id: vendorId, physicalStoreId },
  });

  if (loading) return null;
  const { vendorById } = (data as VendorByIdData) ?? {};
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
        _id: vendorById._id,
        physicalStoreId,
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
      <AntForm
        layout="horizontal"
        onFinish={handleFinish}
        onFieldsChange={handleFieldsChange}
      >
        <TextField
          fieldName="name"
          fieldLabel="Name"
          initialValue={vendorById.name}
          required
          requiredMessage="Please input a name for the vendor."
        />
        <TextField
          fieldName="contactPerson"
          fieldLabel="Contact Person"
          initialValue={vendorById.contactPerson}
        />
        <TextField
          fieldName="contactNumber"
          fieldLabel="Contact Number"
          initialValue={vendorById.contactNumber}
        />
        <TextAreaField
          fieldName="address"
          fieldLabel="Address"
          initialValue={vendorById.address}
        />
        <TextAreaField
          fieldName="notes"
          fieldLabel="Notes"
          initialValue={vendorById.notes}
        />
        <SaveCancelButtons
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </AntForm>
      <AuditInfoComponent record={vendorById} />
    </>
  );
};

EditForm.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default EditForm;
