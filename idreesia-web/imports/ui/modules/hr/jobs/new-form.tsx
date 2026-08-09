import React, { useState } from 'react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { Form } from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { type History } from 'history';

import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import type {
  CreateJobMutation,
  CreateJobMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';
import {
  InputTextField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

const CREATE_JOB: TypedDocumentNode<
  CreateJobMutation,
  CreateJobMutationVariables
> = gql`
  mutation createJob($name: String!, $description: String) {
    createJob(name: $name, description: $description) {
      _id
      name
      description
    }
  }
`;

interface NewFormProps {
  history: History;
}

interface FormValues {
  name: string;
  description?: string;
}

const NewForm = ({ history }: NewFormProps) => {
  useBreadcrumbs(['HR', 'Jobs', 'New']);
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [createJob] = useMutation(CREATE_JOB, {
    refetchQueries: ['allJobs'],
  });

  const handleCancel = () => {
    history.push(paths.jobsPath);
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ name, description }: FormValues) => {
    createJob({
      variables: {
        name,
        description,
      },
    })
      .then(() => {
        history.push(paths.jobsPath);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  return (
    <Form layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
      <InputTextField
        fieldName="name"
        fieldLabel="Job Name"
        required
        requiredMessage="Please input a name for the job."
      />
      <InputTextAreaField
        fieldName="description"
        fieldLabel="Description"
      />
      <FormButtonsSaveCancel
        handleCancel={handleCancel}
        isFieldsTouched={isFieldsTouched}
      />
    </Form>
  );
};

export default NewForm;
