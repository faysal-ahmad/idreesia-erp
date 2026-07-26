// @ts-nocheck
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/client/react';
import { Form, message } from 'antd';

import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import {
  InputTextField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

const formMutation = gql`
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

const NewForm = ({ history }) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [createDuty] = useMutation(formMutation, {
    refetchQueries: ['allMSDuties'],
  });

  const handleCancel = () => {
    history.goBack();
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ name, description, attendanceSheet }) => {
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
      .catch(error => {
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

NewForm.propTypes = {
  history: PropTypes.object,
};

export default WithBreadcrumbs(['HR', 'Duties & Shifts', 'New'])(NewForm);
