import React, { useState } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/client/react';
import { Form, message } from 'antd';

import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';
import {
  InputTextField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

const formMutation = gql`
  mutation createSecurityMehfilDuty($name: String!, $urduName: String!) {
    createSecurityMehfilDuty(name: $name, urduName: $urduName) {
      _id
      name
      urduName
    }
  }
`;

const AntForm = Form as any;
const TextField = InputTextField as any;
const SaveCancelButtons = FormButtonsSaveCancel as any;
interface HistoryLike { push(path: string): void; }
interface NewFormProps { history: HistoryLike; }
interface FormValues { name: string; urduName: string; }

const NewForm = ({ history }: NewFormProps) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [createSecurityMehfilDuty] = useMutation(formMutation as any, {
    refetchQueries: ['allSecurityMehfilDuties'],
  });

  const handleCancel = () => {
    history.push(paths.mehfilDutiesPath);
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = (fieldsValue: FormValues) => {
    createSecurityMehfilDuty({
      variables: {
        name: fieldsValue.name,
        urduName: fieldsValue.urduName,
      },
    })
      .then(() => {
        history.push(paths.mehfilDutiesPath);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  return (
    <AntForm layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
      <TextField
        fieldName="name"
        fieldLabel="Name"
        required
        requiredMessage="Please input a name for the mehfil duty."
      />
      <TextField
        fieldName="urduName"
        fieldLabel="Urdu Name"
        required
        requiredMessage="Please input an urdu name for the mehfil duty."
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

export default WithBreadcrumbs(['Security', 'Mehfil Duties', 'New'])(NewForm as any);
