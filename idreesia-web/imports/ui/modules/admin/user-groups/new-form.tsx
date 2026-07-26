// @ts-nocheck
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@apollo/client/react';
import { Form, message } from 'antd';

import { ModuleNames } from 'meteor/idreesia-common/constants';
import { values } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import {
  InputTextField,
  InputTextAreaField,
  SelectField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

import { CREATE_USER_GROUP } from './gql';

const NewForm = ({ history }) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [createUserGroup] = useMutation(CREATE_USER_GROUP, {
    refetchQueries: ['pagedUserGroups'],
  });

  const handleCancel = () => {
    history.goBack();
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ name, moduleName, description }) => {
    createUserGroup({
      variables: {
        name,
        moduleName,
        description,
      },
    })
      .then(() => {
        history.goBack();
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  const moduleNames = values(ModuleNames);
  const moduleNamesData = moduleNames.map(name => ({
    value: name,
    text: name,
  }));

  return (
    <Form layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
      <InputTextField
        fieldName="name"
        fieldLabel="Group name"
        required
        requiredMessage="Please input a name for the group."
      />

      <SelectField
        data={moduleNamesData}
        getDataValue={({ value }) => value}
        getDataText={({ text }) => text}
        fieldName="moduleName"
        fieldLabel="Module Name"
        required
        requiredMessage="Please select a module for the group."
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

export default WithBreadcrumbs(['Admin', 'User Groups', 'New'])(NewForm);
