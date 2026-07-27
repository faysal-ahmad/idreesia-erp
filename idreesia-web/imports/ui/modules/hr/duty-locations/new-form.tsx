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

const AntForm = Form as any;
const TextField = InputTextField as any;
const SaveCancelButtons = FormButtonsSaveCancel as any;
interface HistoryLike { push(path: string): void; }
interface NewFormProps { history: HistoryLike; }
interface FormValues { name: string; }

const NewForm = ({ history }: NewFormProps) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [createDutyLocation] = useMutation(formMutation as any, {
    refetchQueries: ['allDutyLocations'],
  });

  const handleCancel = () => {
    history.push(paths.dutyLocationsPath);
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = (fieldsValue: FormValues) => {
    createDutyLocation({
      variables: {
        name: fieldsValue.name,
      },
    })
      .then(() => {
        history.push(paths.dutyLocationsPath);
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
        requiredMessage="Please input a name for the duty location."
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

export default WithBreadcrumbs(['HR', 'Duty Locations', 'New'])(NewForm as any);
