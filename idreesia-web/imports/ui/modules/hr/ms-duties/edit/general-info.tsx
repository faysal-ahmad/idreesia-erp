// @ts-nocheck
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

const EditForm = ({ dutyId, history }) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const { data, loading } = useQuery(formQuery, {
    variables: { id: dutyId },
  });
  const [updateDuty] = useMutation(formMutation, {
    refetchQueries: ['allMSDuties'],
  });
  const { dutyById } = data || {};

  const handleCancel = () => {
    history.goBack();
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ name, description, attendanceSheet }) => {
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
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  if (loading || !dutyById) return null;

  return (
    <Fragment>
      <Form layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
        <InputTextField
          fieldName="name"
          fieldLabel="Duty Name"
          initialValue={dutyById.name}
          required
          requiredMessage="Please input a name for the duty."
        />
        <InputTextAreaField
          fieldName="description"
          fieldLabel="Description"
          initialValue={dutyById.description}
        />
        <InputTextField
          fieldName="attendanceSheet"
          fieldLabel="Attendance Sheet"
          initialValue={dutyById.attendanceSheet}
        />
        <FormButtonsSaveCancel
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
      <AuditInfo record={dutyById} />
    </Fragment>
  );
};

EditForm.propTypes = {
  dutyId: PropTypes.string,
  history: PropTypes.object,
};

export default EditForm;
