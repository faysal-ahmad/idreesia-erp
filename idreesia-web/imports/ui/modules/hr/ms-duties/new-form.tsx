import React, { useState } from 'react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { Form, message } from 'antd';
import { type History } from 'history';

import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import type {
  CreateDutyMutation,
  CreateDutyMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';
import {
  InputTextField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

const CREATE_DUTY: TypedDocumentNode<
  CreateDutyMutation,
  CreateDutyMutationVariables
> = gql`
  mutation createDuty(
    $name: String!
    $isMehfilDuty: Boolean!
    $description: String
    $attendanceSheet: String
  ) {
    createDuty(
      name: $name
      isMehfilDuty: $isMehfilDuty
      description: $description
      attendanceSheet: $attendanceSheet
    ) {
      _id
      name
      isMehfilDuty
      description
      attendanceSheet
    }
  }
`;

interface NewFormProps {
  history: History;
}

interface FormValues {
  name: string;
  description?: string;
  attendanceSheet?: string;
}

const NewForm = ({ history }: NewFormProps) => {
  useBreadcrumbs(['HR', 'Duties & Shifts', 'New']);
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [createDuty] = useMutation(CREATE_DUTY, {
    refetchQueries: ['allMSDuties'],
  });

  const handleCancel = () => {
    history.goBack();
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ name, description, attendanceSheet }: FormValues) => {
    createDuty({
      variables: {
        name,
        isMehfilDuty: false,
        description,
        attendanceSheet,
      },
    })
      .then(() => {
        history.goBack();
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  return (
    <Form layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
      <InputTextField
        fieldName="name"
        fieldLabel="Duty Name"
        required
        requiredMessage="Please input a name for the duty."
      />
      <InputTextAreaField
        fieldName="description"
        fieldLabel="Description"
      />
      <InputTextField
        fieldName="attendanceSheet"
        fieldLabel="Attendance Sheet"
      />
      <FormButtonsSaveCancel
        handleCancel={handleCancel}
        isFieldsTouched={isFieldsTouched}
      />
    </Form>
  );
};

export default NewForm;
