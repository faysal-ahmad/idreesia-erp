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
  mutation createSecurityMehfilLangarDish($name: String!, $urduName: String!) {
    createSecurityMehfilLangarDish(name: $name, urduName: $urduName) {
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
  const [createSecurityMehfilLangarDish] = useMutation(formMutation as any, {
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
    <AntForm layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
      <TextField
        fieldName="name"
        fieldLabel="Name"
        required
        requiredMessage="Please input a name for the langar dish."
      />
      <TextField
        fieldName="urduName"
        fieldLabel="Urdu Name"
        required
        requiredMessage="Please input an urdu name for the langar dish."
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

export default WithBreadcrumbs(['Security', 'Mehfil Langar Dishes', 'New'])(NewForm as any);
