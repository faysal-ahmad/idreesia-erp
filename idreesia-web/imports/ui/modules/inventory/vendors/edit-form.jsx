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
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { usePhysicalStore } from '/imports/ui/modules/inventory/common/hooks';

import {
  VENDOR_BY_ID,
  VENDORS_BY_PHYSICAL_STORE_ID,
  UPDATE_VENDOR,
} from './gql';

const EditForm = ({ history }) => {
  const dispatch = useDispatch();
  const { physicalStoreId, vendorId } = useParams();
  const { physicalStore } = usePhysicalStore(physicalStoreId);
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [updateVendor] = useMutation(UPDATE_VENDOR, {
    refetchQueries: [{ 
      query: VENDORS_BY_PHYSICAL_STORE_ID,
      variables: {
        physicalStoreId,
      }
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
  }, [physicalStore]);

  const { data, loading } = useQuery(VENDOR_BY_ID, {
    variables: { _id: vendorId, physicalStoreId }
  });

  if (loading) return null;
  const { vendorById } = data;

  const handleCancel = () => {
    history.goBack();
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  }

  const handleFinish = ({ name, contactPerson, contactNumber, address, notes }) => {
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
          initialValue={vendorById.name}
          required
          requiredMessage="Please input a name for the vendor."
        />
        <InputTextField
          fieldName="contactPerson"
          fieldLabel="Contact Person"
          initialValue={vendorById.contactPerson}
        />
        <InputTextField
          fieldName="contactNumber"
          fieldLabel="Contact Number"
          initialValue={vendorById.contactNumber}
        />
        <InputTextAreaField
          fieldName="address"
          fieldLabel="Address"
          initialValue={vendorById.address}
        />
        <InputTextAreaField
          fieldName="notes"
          fieldLabel="Notes"
          initialValue={vendorById.notes}
        />
        <FormButtonsSaveCancel
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
      <AuditInfo record={vendorById} />
    </>
  );
}

EditForm.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default EditForm;
