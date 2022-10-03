import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Form, message } from 'antd';
import { useDispatch } from 'react-redux';
import { useQuery, useMutation } from '@apollo/react-hooks';

import { get } from 'meteor/idreesia-common/utilities/lodash';
import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import {
  InputTextField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { AuditInfo } from '/imports/ui/modules/common';

import { WAZAIF_VENDOR_BY_ID, UPDATE_WAZAIF_VENDOR } from './gql';

const EditForm = ({ history, match }) => {
  const vendorId = get(
    match,
    ['params', 'vendorId'],
    null
  );

  const dispatch = useDispatch();
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [updateWazaifVendor] = useMutation(UPDATE_WAZAIF_VENDOR);
  const { data, loading } = useQuery(WAZAIF_VENDOR_BY_ID, {
    skip: !vendorId,
    variables: {
      _id: vendorId,
    },
  });

  useEffect(() => {
    dispatch(setBreadcrumbs(['Operations', 'Wazaif Management', 'Setup', 'Update Vendor']));
  }, []);

  if (loading || !data) return null;
  const { wazaifVendorById } = data; 

  const handleCancel = () => {
    history.goBack();
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  }

  const handleFinish = ({ name, contactPerson, contactNumber, address, notes }) => {
    updateWazaifVendor({
      variables: {
        _id: wazaifVendorById._id,
        name,
        contactPerson,
        contactNumber,
        address,
        notes,
      },
    })
      .then(() => {
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
          initialValue={wazaifVendorById.name}
          required
          requiredMessage="Please input a name for the vendor."
        />
        <InputTextField
          fieldName="contactPerson"
          fieldLabel="Contact Person"
          initialValue={wazaifVendorById.contactPerson}
        />
        <InputTextField
          fieldName="contactNumber"
          fieldLabel="Contact Number"
          initialValue={wazaifVendorById.contactNumber}
        />
        <InputTextAreaField
          fieldName="address"
          fieldLabel="Address"
          initialValue={wazaifVendorById.address}
        />
        <InputTextAreaField
          fieldName="notes"
          fieldLabel="Notes"
          initialValue={wazaifVendorById.notes}
        />
        <FormButtonsSaveCancel
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
      <AuditInfo record={wazaifVendorById} />
    </>
  );
}

EditForm.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default EditForm;
