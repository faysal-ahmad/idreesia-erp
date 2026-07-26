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
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

const formMutation = gql`
  mutation createDutyLocation($name: String!) {
    createDutyLocation(name: $name) {
      _id
      name
    }
  }
`;

const NewForm = ({ history }) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [createDutyLocation] = useMutation(formMutation, {
    refetchQueries: ['allDutyLocations'],
  });

  const handleCancel = () => {
    history.push(paths.dutyLocationsPath);
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = fieldsValue => {
    createDutyLocation({
      variables: {
        name: fieldsValue.name,
      },
    })
      .then(() => {
        history.push(paths.dutyLocationsPath);
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  return (
    <Form layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
      <InputTextField
        fieldName="name"
        fieldLabel="Name"
        required
        requiredMessage="Please input a name for the duty location."
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

export default WithBreadcrumbs(['HR', 'Duty Locations', 'New'])(NewForm);
