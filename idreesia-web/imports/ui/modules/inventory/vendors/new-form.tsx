import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Form, message } from 'antd';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useMutation } from '@apollo/client/react';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
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

const AntForm = Form as any;
const TextField = InputTextField as any;
const TextAreaField = InputTextAreaField as any;
const SaveCancelButtons = FormButtonsSaveCancel as any;

interface RouteParams {
  physicalStoreId: string;
}

interface HistoryLike {
  goBack(): void;
}

interface NewFormProps {
  history: HistoryLike;
}

interface VendorFormValues {
  name: string;
  contactPerson?: string;
  contactNumber?: string;
  address?: string;
  notes?: string;
}

const NewForm = ({ history }: NewFormProps) => {
  const dispatch = useDispatch();
  const { physicalStoreId } = useParams<RouteParams>();
  const { physicalStore } = usePhysicalStore(physicalStoreId);
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [createVendor] = useMutation(CREATE_VENDOR as any, {
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
        setBreadcrumbs(['Inventory', physicalStore.name, 'Setup', 'Vendors', 'New'])
      );
    } else {
      dispatch(setBreadcrumbs(['Inventory', 'Setup', 'Vendors', 'New']));
    }
  }, [dispatch, physicalStore]);

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
        physicalStoreId,
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
    <AntForm
      layout="horizontal"
      onFinish={handleFinish}
      onFieldsChange={handleFieldsChange}
    >
      <TextField
        fieldName="name"
        fieldLabel="Name"
        required
        requiredMessage="Please input a name for the vendor."
      />
      <TextField
        fieldName="contactPerson"
        fieldLabel="Contact Person"
      />
      <TextField
        fieldName="contactNumber"
        fieldLabel="Contact Number"
      />
      <TextAreaField
        fieldName="address"
        fieldLabel="Address"
      />
      <TextAreaField
        fieldName="notes"
        fieldLabel="Notes"
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
