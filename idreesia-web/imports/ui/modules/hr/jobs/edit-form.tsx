import React, { Fragment, useState } from 'react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { Form } from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { type match } from 'react-router';
import { type History } from 'history';

import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import type {
  JobByIdQuery,
  JobByIdQueryVariables,
  UpdateJobMutation,
  UpdateJobMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';
import {
  InputTextField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import AuditInfo from '/imports/ui/modules/common/audit-info/audit-info';

const JOB_BY_ID: TypedDocumentNode<
  JobByIdQuery,
  JobByIdQueryVariables
> = gql`
  query jobById($id: String!) {
    jobById(id: $id) {
      _id
      name
      description
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

const UPDATE_JOB: TypedDocumentNode<
  UpdateJobMutation,
  UpdateJobMutationVariables
> = gql`
  mutation updateJob($id: String!, $name: String!, $description: String) {
    updateJob(id: $id, name: $name, description: $description) {
      _id
      name
      description
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

interface EditFormProps {
  match: match<{ jobId: string }>;
  history: History;
}

interface FormValues {
  name: string;
  description?: string;
}

const EditForm = ({ match, history }: EditFormProps) => {
  useBreadcrumbs(['HR', 'Jobs', 'Edit']);
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const jobId = match.params.jobId;
  const { loading, data } = useQuery(JOB_BY_ID, {
    variables: { id: jobId },
  });
  const [updateJob] = useMutation(UPDATE_JOB, {
    refetchQueries: ['allJobs'],
  });
  const jobById = data?.jobById;

  const handleCancel = () => {
    history.push(paths.jobsPath);
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ name, description }: FormValues) => {
    if (!jobById?._id) return;
    updateJob({
      variables: {
        id: jobById._id,
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

  if (loading || !jobById?._id) return null;

  return (
    <Fragment>
      <Form layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
        <InputTextField
          fieldName="name"
          fieldLabel="Job Name"
          initialValue={jobById.name ?? undefined}
          required
          requiredMessage="Please input a name for the job."
        />
        <InputTextAreaField
          fieldName="description"
          fieldLabel="Description"
          initialValue={jobById.description ?? undefined}
        />
        <FormButtonsSaveCancel
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
      <AuditInfo record={jobById ?? {}} />
    </Fragment>
  );
};

export default EditForm;
