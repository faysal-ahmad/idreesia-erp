import React, { useState } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useMutation, useQuery } from '@apollo/client/react';
import { Form, message } from 'antd';

import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';
import {
  InputTextField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

const formQuery = gql`
  query adminPhysicalStoreById($id: String!) {
    physicalStoreById(id: $id) {
      _id
      name
      address
    }
  }
`;

const formMutation = gql`
  mutation updatePhysicalStore(
    $id: String!
    $name: String!
    $address: String!
  ) {
    updatePhysicalStore(id: $id, name: $name, address: $address) {
      _id
      name
      address
    }
  }
`;

const AntForm = Form as any;
const TextField = InputTextField as any;
const TextAreaField = InputTextAreaField as any;
const SaveCancelButtons = FormButtonsSaveCancel as any;
interface HistoryLike { push(path: string): void; }
interface FormValues { name: string; address?: string; }
interface MatchLike { params: { physicalStoreId: string; }; }
interface PhysicalStore { _id: string; name?: string; address?: string; }
interface QueryData { physicalStoreById?: PhysicalStore | null; }
interface Props { match: MatchLike; history: HistoryLike; }

const EditForm = ({ match, history }: Props) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const { physicalStoreId } = match.params;
  const { data, loading } = useQuery(formQuery as any, {
    variables: { id: physicalStoreId },
  });
  const [updatePhysicalStore] = useMutation(formMutation as any, {
    refetchQueries: ['allPhysicalStores', 'allAccessiblePhysicalStores'],
  });
  const { physicalStoreById } = (data ?? {}) as QueryData;

  const handleCancel = () => {
    history.push(paths.physicalStoresPath);
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = (fieldsValue: FormValues) => {
    updatePhysicalStore({
      variables: {
        id: physicalStoreById?._id,
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

  if (loading) return null;

  return (
    <AntForm layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
      <TextField
        fieldName="name"
        fieldLabel="Name"
        initialValue={physicalStoreById?.name}
        required
        requiredMessage="Please input a name for the physical store."
      />
      <TextAreaField
        fieldName="address"
        fieldLabel="Address"
        initialValue={physicalStoreById?.address}
        required={false}
      />
      <SaveCancelButtons
        handleCancel={handleCancel}
        isFieldsTouched={isFieldsTouched}
      />
    </AntForm>
  );
};

EditForm.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default WithBreadcrumbs(['Admin', 'Setup', 'Physical Stores', 'Edit'])(EditForm as any);
