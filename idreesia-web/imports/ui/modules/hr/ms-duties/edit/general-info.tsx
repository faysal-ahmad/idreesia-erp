import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useMutation, useQuery } from '@apollo/client/react';
import { Form, message } from 'antd';

import {
  InputTextField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { AuditInfo } from '/imports/ui/modules/common';

const formQuery = gql`
  query dutyById($id: String!) {
    dutyById(id: $id) {
      _id
      name
      description
      attendanceSheet
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

const formMutation = gql`
  mutation updateDuty(
    $id: String!
    $name: String!
    $description: String
    $attendanceSheet: String
  ) {
    updateDuty(
      id: $id
      name: $name
      description: $description
      attendanceSheet: $attendanceSheet
    ) {
      _id
      name
      description
      attendanceSheet
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
interface HistoryLike { goBack(): void; }
interface EditFormProps { dutyId?: string | null; history?: HistoryLike; }
interface DutyRecord { _id: string; name: string; description?: string; attendanceSheet?: string; }
interface QueryData { dutyById?: DutyRecord | null; }
interface FormValues { name: string; description?: string; attendanceSheet?: string; }

const EditForm = ({ dutyId, history }: EditFormProps) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const { data, loading } = useQuery(formQuery as any, {
    variables: { id: dutyId },
  });
  const [updateDuty] = useMutation(formMutation as any, {
    refetchQueries: ['allMSDuties'],
  });
  const { dutyById } = (data ?? {}) as QueryData;

  const handleCancel = () => {
    history?.goBack();
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ name, description, attendanceSheet }: FormValues) => {
    if (!dutyById) return;
    updateDuty({
      variables: {
        id: dutyById._id,
        name,
        description,
        attendanceSheet,
      },
    })
      .then(() => {
        history?.goBack();
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  if (loading || !dutyById) return null;

  return (
    <ReactFragment>
      <AntForm layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
        <TextField
          fieldName="name"
          fieldLabel="Duty Name"
          initialValue={dutyById.name}
          required
          requiredMessage="Please input a name for the duty."
        />
        <TextAreaField
          fieldName="description"
          fieldLabel="Description"
          initialValue={dutyById.description}
        />
        <TextField
          fieldName="attendanceSheet"
          fieldLabel="Attendance Sheet"
          initialValue={dutyById.attendanceSheet}
        />
        <SaveCancelButtons
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </AntForm>
      <AuditInfoComponent record={dutyById} />
    </ReactFragment>
  );
};

EditForm.propTypes = {
  dutyId: PropTypes.string,
  history: PropTypes.object,
};

export default EditForm;
