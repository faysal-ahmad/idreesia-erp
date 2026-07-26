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

const EditForm = ({ match, history }) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const { jobId } = match.params;
  const { loading, data } = useQuery(formQuery, {
    variables: { id: jobId },
  });
  const [updateJob] = useMutation(formMutation, {
    refetchQueries: ['allJobs'],
  });
  const jobById = data ? data.jobById : null;

  const handleCancel = () => {
    history.push(paths.jobsPath);
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ name, description }) => {
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
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  if (loading) return null;

  return (
    <Fragment>
      <Form layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
        <InputTextField
          fieldName="name"
          fieldLabel="Job Name"
          initialValue={jobById.name}
          required
          requiredMessage="Please input a name for the job."
        />
        <InputTextAreaField
          disabled
          fieldName="description"
          fieldLabel="Description"
          initialValue={jobById.description}
        />
        <FormButtonsSaveCancel
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
      <AuditInfo record={jobById} />
    </Fragment>
  );
};

EditForm.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default WithBreadcrumbs(['HR', 'Jobs', 'Edit'])(EditForm);
