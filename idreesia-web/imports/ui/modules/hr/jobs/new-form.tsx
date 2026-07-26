// @ts-nocheck
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/client/react';
import { Form, message } from 'antd';

import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';
import {
  InputTextField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

const formMutation = gql`
  mutation createJob($name: String!, $description: String) {
    createJob(name: $name, description: $description) {
      _id
      name
      description
    }
  }
`;

const NewForm = ({ history }) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [createJob] = useMutation(formMutation, {
    refetchQueries: ['allJobs'],
  });

  const handleCancel = () => {
    history.push(paths.jobsPath);
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ name, description }) => {
    createJob({
      variables: {
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

NewForm.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default WithBreadcrumbs(['HR', 'Jobs', 'New'])(NewForm);
