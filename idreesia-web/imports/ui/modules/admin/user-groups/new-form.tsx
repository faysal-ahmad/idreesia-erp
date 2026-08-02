import React, { useState } from 'react';
import { type RouteComponentProps } from 'react-router';
import { useMutation } from '@apollo/client/react';
import { Form, message } from 'antd';

import { ModuleNames } from 'meteor/idreesia-common/constants';
import { values } from 'meteor/idreesia-common/utilities/lodash';
import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import {
  InputTextField,
  InputTextAreaField,
  SelectField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

import { CREATE_USER_GROUP, PAGED_USER_GROUPS } from './gql';

interface FormValues {
  name: string;
  moduleName: string;
  description?: string;
}

interface ModuleNameOption {
  value: string;
  text: string;
}

type Props = RouteComponentProps;

const NewForm = ({ history }: Props) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  useBreadcrumbs(['Admin', 'User Groups', 'New']);
  const [createUserGroup] = useMutation(CREATE_USER_GROUP, {
    refetchQueries: [{ query: PAGED_USER_GROUPS }],
  });

  const handleCancel = () => {
    history.goBack();
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ name, moduleName, description }: FormValues) => {
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
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const moduleNames = values(ModuleNames);
  const moduleNamesData = moduleNames.map((name: string) => ({
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
        getDataValue={({ value }: ModuleNameOption) => value}
        getDataText={({ text }: ModuleNameOption) => text}
        fieldName="moduleName"
        fieldLabel="Module Name"
        required
        requiredMessage="Please select a module for the group."
      />

      <InputTextAreaField fieldName="description" fieldLabel="Description" />

      <FormButtonsSaveCancel
        handleCancel={handleCancel}
        isFieldsTouched={isFieldsTouched}
      />
    </Form>
  );
};

export default NewForm;
