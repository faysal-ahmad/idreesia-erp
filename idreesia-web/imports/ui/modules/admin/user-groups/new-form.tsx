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

const AntForm = Form as any;
const TextField = InputTextField as any;
const TextAreaField = InputTextAreaField as any;
const SelectInputField = SelectField as any;
const SaveCancelButtons = FormButtonsSaveCancel as any;
interface HistoryLike { goBack(): void; }
interface FormValues { name: string; moduleName: string; description?: string; }
interface ModuleNameOption { value: string; text: string; }
interface Props { history: HistoryLike; }

const NewForm = ({ history }: Props) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [createUserGroup] = useMutation(CREATE_USER_GROUP as any, {
    refetchQueries: ['pagedUserGroups'],
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
    <AntForm layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
      <TextField
        fieldName="name"
        fieldLabel="Group name"
        required
        requiredMessage="Please input a name for the group."
      />

      <SelectInputField
        data={moduleNamesData}
        getDataValue={({ value }: ModuleNameOption) => value}
        getDataText={({ text }: ModuleNameOption) => text}
        fieldName="moduleName"
        fieldLabel="Module Name"
        required
        requiredMessage="Please select a module for the group."
      />

      <TextAreaField
        fieldName="description"
        fieldLabel="Description"
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
  location: PropTypes.object,
};

export default WithBreadcrumbs(['Admin', 'User Groups', 'New'])(NewForm as any);
