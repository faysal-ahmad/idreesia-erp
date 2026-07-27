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

const AntForm = Form as any;
const TextField = InputTextField as any;
const TextAreaField = InputTextAreaField as any;
const SaveCancelButtons = FormButtonsSaveCancel as any;
interface HistoryLike { goBack(): void; }
interface NewFormProps { history: HistoryLike; }
interface FormValues { name: string; description?: string; attendanceSheet?: string; }

const NewForm = ({ history }: NewFormProps) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [createDuty] = useMutation(formMutation as any, {
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
    <AntForm layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
      <TextField
        fieldName="name"
        fieldLabel="Duty Name"
        required
        requiredMessage="Please input a name for the duty."
      />
      <TextAreaField
        fieldName="description"
        fieldLabel="Description"
      />
      <TextField
        fieldName="attendanceSheet"
        fieldLabel="Attendance Sheet"
      />
      <SaveCancelButtons
        handleCancel={handleCancel}
        isFieldsTouched={isFieldsTouched}
      />
    </AntForm>
  );
};

NewForm.propTypes = {
  history: PropTypes.object,
};

export default WithBreadcrumbs(['HR', 'Duties & Shifts', 'New'])(NewForm as any);
