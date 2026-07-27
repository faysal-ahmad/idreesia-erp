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

const AntForm = Form as any;
const TextField = InputTextField as any;
const FormDateField = DateField as any;
const SaveCancelButtons = FormButtonsSaveCancel as any;

interface HistoryLike {
  goBack(): void;
}

interface NewFormProps {
  history: HistoryLike;
}

interface MehfilFormValues {
  name: string;
  mehfilDate: string | number | Date;
}

const NewForm = ({ history }: NewFormProps) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [createMehfil] = useMutation(CREATE_MEHFIL as any, {
    refetchQueries: [{ query: ALL_MEHFILS as any }],
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
        mehfilDate,
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
    <AntForm layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
      <TextField
        fieldName="name"
        fieldLabel="Mehfil Name"
        required
        requiredMessage="Please input a name for the mehfil."
      />
      <FormDateField
        fieldName="mehfilDate"
        fieldLabel="Mehfil Date"
        required
        requiredMessage="Please input a date for the mehfil."
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

export default WithBreadcrumbs(['Security', 'Mehfils', 'New'])(NewForm as any);
