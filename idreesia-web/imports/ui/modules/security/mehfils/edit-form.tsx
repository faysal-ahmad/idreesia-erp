// @ts-nocheck
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQuery } from '@apollo/client/react';
import { Form, message } from 'antd';
import dayjs from 'dayjs';

import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import {
  InputTextField,
  DateField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { AuditInfo } from '/imports/ui/modules/common';

import { MEHFIL_BY_ID, UPDATE_MEHFIL, ALL_MEHFILS } from './gql';

const EditForm = ({ match, history }) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const { mehfilId } = match.params;
  const { loading, data } = useQuery(MEHFIL_BY_ID, {
    variables: { _id: mehfilId },
  });
  const [updateMehfil] = useMutation(UPDATE_MEHFIL, {
    refetchQueries: [{ query: ALL_MEHFILS }],
  });
  const mehfilById = data ? data.mehfilById : null;

  const handleCancel = () => {
    history.goBack();
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ name, mehfilDate }) => {
    updateMehfil({
      variables: {
        _id: mehfilById._id,
        name,
        mehfilDate,
      },
    })
      .catch(error => {
        message.error(error.message, 5);
      })
      .finally(() => {
        history.goBack();
      });
  };

  if (loading) return null;

  return (
    <>
      <Form layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
        <InputTextField
          fieldName="name"
          fieldLabel="Mehfil Name"
          initialValue={mehfilById.name}
          required
          requiredMessage="Please input a name for the Mehfil."
        />
        <DateField
          fieldName="mehfilDate"
          fieldLabel="Mehfil Date"
          initialValue={dayjs(Number(mehfilById.mehfilDate))}
        />
        <FormButtonsSaveCancel
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
      <AuditInfo record={mehfilById} />
    </>
  );
};

EditForm.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default WithBreadcrumbs(['Security', 'Mehfils', 'Edit'])(EditForm);
