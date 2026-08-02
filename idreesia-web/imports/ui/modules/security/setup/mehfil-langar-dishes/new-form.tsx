import React, { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { Form, message } from 'antd';
import { type History } from 'history';

import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';
import {
  InputTextField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

import { CREATE_SECURITY_MEHFIL_LANGAR_DISH } from './gql';

interface NewFormProps {
  history: History;
}

interface FormValues {
  name: string;
  urduName: string;
}

const NewForm = ({ history }: NewFormProps) => {
  useBreadcrumbs(['Security', 'Mehfil Langar Dishes', 'New']);
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [createSecurityMehfilLangarDish] = useMutation(CREATE_SECURITY_MEHFIL_LANGAR_DISH, {
    refetchQueries: ['allSecurityMehfilLangarDishes'],
  });

  const handleCancel = () => {
    history.push(paths.mehfilLangarDishesPath);
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = (fieldsValue: FormValues) => {
    createSecurityMehfilLangarDish({
      variables: {
        name: fieldsValue.name,
        urduName: fieldsValue.urduName,
      },
    })
      .then(() => {
        history.push(paths.mehfilLangarDishesPath);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  return (
    <Form layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
      <InputTextField
        fieldName="name"
        fieldLabel="Name"
        required
        requiredMessage="Please input a name for the langar dish."
      />
      <InputTextField
        fieldName="urduName"
        fieldLabel="Urdu Name"
        required
        requiredMessage="Please input an urdu name for the langar dish."
      />
      <FormButtonsSaveCancel
        handleCancel={handleCancel}
        isFieldsTouched={isFieldsTouched}
      />
    </Form>
  );
};

export default NewForm;
