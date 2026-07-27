import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useMutation, useQuery } from '@apollo/client/react';
import { Form, message } from 'antd';

import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';
import {
  InputTextField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { AuditInfo } from '/imports/ui/modules/common';

const formQuery = gql`
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

const formMutation = gql`
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

const ReactFragment = Fragment as any;
const AntForm = Form as any;
const TextField = InputTextField as any;
const TextAreaField = InputTextAreaField as any;
const SaveCancelButtons = FormButtonsSaveCancel as any;
const AuditInfoComponent = AuditInfo as any;
interface HistoryLike { push(path: string): void; }
interface MatchLike { params: Record<string, string>; }
interface EditFormProps { match: MatchLike; history: HistoryLike; }
interface RecordData { _id: string; name: string; description?: string; }
interface QueryData { jobById?: RecordData | null; }
interface FormValues { name: string; description?: string; }

const EditForm = ({ match, history }: EditFormProps) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const { jobId } = match.params;
  const { loading, data } = useQuery(formQuery as any, {
    variables: { id: jobId },
  });
  const [updateJob] = useMutation(formMutation as any, {
    refetchQueries: ['allJobs'],
  });
  const jobById = data ? (data as QueryData).jobById : null;

  const handleCancel = () => {
    history.push(paths.jobsPath);
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ name, description }: FormValues) => {
    if (!jobById) return;
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

  if (loading || !jobById) return null;

  return (
    <ReactFragment>
      <AntForm layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
        <TextField
          fieldName="name"
          fieldLabel="Job Name"
          initialValue={jobById.name}
          required
          requiredMessage="Please input a name for the job."
        />
        <TextAreaField
          disabled
          fieldName="description"
          fieldLabel="Description"
          initialValue={jobById.description}
        />
        <SaveCancelButtons
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </AntForm>
      <AuditInfoComponent record={jobById} />
    </ReactFragment>
  );
};

EditForm.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default WithBreadcrumbs(['HR', 'Jobs', 'Edit'])(EditForm as any);
