import React, { Fragment, useState } from 'react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { Form, message } from 'antd';
import { type History } from 'history';

import type {
  DutyByIdQuery,
  DutyByIdQueryVariables,
  UpdateDutyMutation,
  UpdateDutyMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';
import {
  InputTextField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import AuditInfo from '/imports/ui/modules/common/audit-info/audit-info';

const DUTY_BY_ID: TypedDocumentNode<
  DutyByIdQuery,
  DutyByIdQueryVariables
> = gql`
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

const UPDATE_DUTY: TypedDocumentNode<
  UpdateDutyMutation,
  UpdateDutyMutationVariables
> = gql`
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

interface EditFormProps {
  dutyId: string;
  history: History;
}

interface FormValues {
  name: string;
  description?: string;
  attendanceSheet?: string;
}

const EditForm = ({ dutyId, history }: EditFormProps) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const { data, loading } = useQuery(DUTY_BY_ID, {
    variables: { id: dutyId },
  });
  const [updateDuty] = useMutation(UPDATE_DUTY, {
    refetchQueries: ['allMSDuties'],
  });
  const dutyById = data?.dutyById;

  const handleCancel = () => {
    history.goBack();
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ name, description, attendanceSheet }: FormValues) => {
    if (!dutyById?._id) return;
    updateDuty({
      variables: {
        id: dutyById._id,
        name,
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

  if (loading || !dutyById?._id) return null;

  return (
    <Fragment>
      <Form layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
        <InputTextField
          fieldName="name"
          fieldLabel="Duty Name"
          initialValue={dutyById.name ?? undefined}
          required
          requiredMessage="Please input a name for the duty."
        />
        <InputTextAreaField
          fieldName="description"
          fieldLabel="Description"
          initialValue={dutyById.description ?? undefined}
        />
        <InputTextField
          fieldName="attendanceSheet"
          fieldLabel="Attendance Sheet"
          initialValue={dutyById.attendanceSheet ?? undefined}
        />
        <FormButtonsSaveCancel
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
      <AuditInfo record={dutyById ?? {}} />
    </Fragment>
  );
};

export default EditForm;
