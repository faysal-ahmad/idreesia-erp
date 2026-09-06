import React, { useState } from 'react';
import { type History } from 'history';
import { useMutation } from '@apollo/client/react';
import { Form } from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';
import {
  InputTextField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

import { CREATE_PHYSICAL_STORE } from './gql';

interface FormValues {
  name: string;
  address?: string;
}

interface Props {
  history: History;
}

const NewForm = ({ history }: Props) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  useBreadcrumbs(['Admin', 'Setup', 'Physical Stores', 'New']);
  const [createPhysicalStore] = useMutation(CREATE_PHYSICAL_STORE, {
    refetchQueries: ['adminAllPhysicalStores', 'allAccessiblePhysicalStores'],
  });

  const handleCancel = () => {
    history.push(paths.physicalStoresPath);
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = (fieldsValue: FormValues) => {
    createPhysicalStore({
      variables: {
        name: fieldsValue.name,
        address: fieldsValue.address,
      },
    })
      .then(() => {
        history.push(paths.physicalStoresPath);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  return (
    <Form layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
      <InputTextField
        fieldName="name"
        fieldLabel="Name"
        required
        requiredMessage="Please input a name for the physical store."
      />
      <InputTextAreaField
        fieldName="address"
        fieldLabel="Address"
        required={false}
      />
      <FormButtonsSaveCancel
        handleCancel={handleCancel}
        isFieldsTouched={isFieldsTouched}
      />
    </Form>
  );
};

export default NewForm;
