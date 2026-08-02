import React, { useState } from 'react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { Form, message } from 'antd';
import { type History } from 'history';

import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import type {
  CreateDutyLocationMutation,
  CreateDutyLocationMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';
import {
  InputTextField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

const CREATE_DUTY_LOCATION: TypedDocumentNode<
  CreateDutyLocationMutation,
  CreateDutyLocationMutationVariables
> = gql`
  mutation createDutyLocation($name: String!) {
    createDutyLocation(name: $name) {
      _id
      name
    }
  }
`;

interface NewFormProps {
  history: History;
}

interface FormValues {
  name: string;
}

const NewForm = ({ history }: NewFormProps) => {
  useBreadcrumbs(['HR', 'Duty Locations', 'New']);
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [createDutyLocation] = useMutation(CREATE_DUTY_LOCATION, {
    refetchQueries: ['allDutyLocations'],
  });

  const handleCancel = () => {
    history.push(paths.dutyLocationsPath);
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = (fieldsValue: FormValues) => {
    createDutyLocation({
      variables: {
        name: fieldsValue.name,
      },
    })
      .then(() => {
        history.push(paths.dutyLocationsPath);
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
        requiredMessage="Please input a name for the duty location."
      />
      <FormButtonsSaveCancel
        handleCancel={handleCancel}
        isFieldsTouched={isFieldsTouched}
      />
    </Form>
  );
};

export default NewForm;
