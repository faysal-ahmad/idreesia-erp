import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@apollo/client/react';
import { Form, message } from 'antd';

import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import {
  InputTextField,
  DateField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

import { CREATE_MEHFIL, ALL_MEHFILS } from './gql';

const NewForm = ({ history }) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [createMehfil] = useMutation(CREATE_MEHFIL, {
    refetchQueries: [{ query: ALL_MEHFILS }],
  });

  const handleCancel = () => {
    history.goBack();
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ name, mehfilDate }) => {
    createMehfil({
      variables: {
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

  return (
    <Form layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
      <InputTextField
        fieldName="name"
        fieldLabel="Mehfil Name"
        required
        requiredMessage="Please input a name for the mehfil."
      />
      <DateField
        fieldName="mehfilDate"
        fieldLabel="Mehfil Date"
        required
        requiredMessage="Please input a date for the mehfil."
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

export default WithBreadcrumbs(['Security', 'Mehfils', 'New'])(NewForm);
