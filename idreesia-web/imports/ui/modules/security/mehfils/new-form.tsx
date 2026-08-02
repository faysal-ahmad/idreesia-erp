import React, { useState } from 'react';
import { type RouteComponentProps } from 'react-router';
import { useMutation } from '@apollo/client/react';
import { Form, message } from 'antd';

import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import {
  InputTextField,
  DateField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

import { CREATE_MEHFIL, ALL_MEHFILS } from './gql';

type Props = RouteComponentProps;

interface MehfilFormValues {
  name: string;
  mehfilDate: string | number | Date;
}

const NewForm = ({ history }: Props) => {
  useBreadcrumbs(['Security', 'Mehfils', 'New']);

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

  const handleFinish = ({ name, mehfilDate }: MehfilFormValues) => {
    createMehfil({
      variables: {
        name,
        mehfilDate: String(mehfilDate),
      },
    })
      .catch((error: Error) => {
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

export default NewForm;
