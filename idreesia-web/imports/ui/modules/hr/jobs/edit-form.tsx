import React, { useState } from 'react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { Collapse, Empty, Form, Spin, type CollapseProps } from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { type match } from 'react-router';
import { type History } from 'history';

import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
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

const JOB_BY_ID: TypedDocumentNode<JobByIdQuery, JobByIdQueryVariables> = gql`
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
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const jobId = match.params.jobId;
  const { loading, data } = useQuery(JOB_BY_ID, {
    variables: { id: jobId },
  });
  const [updateJob] = useMutation(UPDATE_JOB, {
    refetchQueries: ['allJobs', 'jobById'],
  });
  const jobById = data?.jobById;
  const jobName = jobById?.name?.trim();

  useDynamicBreadcrumbs(['HR', 'Jobs', jobName || 'Edit']);

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
        message.success('Job updated', 2);
        setIsFieldsTouched(false);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!jobById?._id) {
    return <Empty description="Job not found" style={{ padding: '80px 0' }} />;
  }

  const sectionItems: CollapseProps['items'] = [
    {
      key: 'details',
      label: 'Job Details',
      forceRender: true,
      children: (
        <>
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
        </>
      ),
    },
  ];

  return (
    <div className="visitor-form">
      <Form
        layout="horizontal"
        onFinish={handleFinish}
        onFieldsChange={handleFieldsChange}
      >
        <Collapse
          className="visitor-form-sections"
          defaultActiveKey={['details']}
          items={sectionItems}
        />
        <FormButtonsSaveCancel
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
          fullWidth
        />
      </Form>
      <AuditInfo record={jobById} />
    </div>
  );
};

export default EditForm;
