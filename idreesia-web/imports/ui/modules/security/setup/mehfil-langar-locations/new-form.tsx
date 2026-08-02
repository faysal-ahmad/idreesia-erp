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

import { CREATE_SECURITY_MEHFIL_LANGAR_LOCATION } from './gql';

interface NewFormProps {
  history: History;
}

interface FormValues {
  name: string;
  urduName: string;
}

const NewForm = ({ history }: NewFormProps) => {
  useBreadcrumbs(['Security', 'Mehfil Langar Locations', 'New']);
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [createSecurityMehfilLangarLocation] = useMutation(CREATE_SECURITY_MEHFIL_LANGAR_LOCATION, {
    refetchQueries: ['allSecurityMehfilLangarLocations'],
  });

  const handleCancel = () => {
    history.push(paths.mehfilLangarLocationsPath);
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = (fieldsValue: FormValues) => {
    createSecurityMehfilLangarLocation({
      variables: {
        name: fieldsValue.name,
        urduName: fieldsValue.urduName,
      },
    })
      .then(() => {
        history.push(paths.mehfilLangarLocationsPath);
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
        requiredMessage="Please input a name for the langar location."
      />
      <InputTextField
        fieldName="urduName"
        fieldLabel="Urdu Name"
        required
        requiredMessage="Please input an urdu name for the langar location."
      />
      <FormButtonsSaveCancel
        handleCancel={handleCancel}
        isFieldsTouched={isFieldsTouched}
      />
    </Form>
  );
};

export default NewForm;
