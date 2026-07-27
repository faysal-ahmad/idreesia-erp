import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@apollo/client/react';
import { Form, message } from 'antd';

import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import {
  InputTextField,
  KarkunSelectionInputField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

import { CREATE_USER, PAGED_USERS } from './gql';

const AntForm = Form as any;
const TextField = InputTextField as any;
const KarkunSelectionField = KarkunSelectionInputField as any;
const SaveCancelButtons = FormButtonsSaveCancel as any;
interface HistoryLike { goBack(): void; }
interface KarkunValue { _id?: string; }
interface FormValues { karkun?: KarkunValue | null; userName?: string; password?: string; email?: string; displayName?: string; }
interface Props { history: HistoryLike; }

const NewForm = ({ history }: Props) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const formRef = useRef<any>(null);
  const [createUser] = useMutation(CREATE_USER as any, {
    refetchQueries: [{ query: PAGED_USERS as any, variables: { filter: {} } }],
  });

  const handleCancel = () => {
    history.goBack();
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ karkun, userName, password, email, displayName }: FormValues) => {
    if ((userName && password) || (email && email.includes('@gmail.com'))) {
      createUser({
        variables: {
          personId: karkun ? karkun._id : null,
          userName,
          password,
          email,
          displayName,
        },
      })
        .then(() => {
          history.goBack();
        })
        .catch((error: Error) => {
          message.error(error.message, 5);
        });
    } else {
      formRef.current?.setFields([
        {
          name: 'userName',
          errors: ['Either user name and password, or google email is required to create an account.'],
        },
        {
          name: 'password',
          errors: ['Either user name and password, or google email is required to create an account.'],
        },
        {
          name: 'email',
          errors: ['Either user name and password, or google email is required to create an account.'],
        },
      ]);
    }
  };

  return (
    <AntForm ref={formRef} layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
      <TextField
        fieldName="userName"
        fieldLabel="User name"
      />

      <TextField
        fieldName="password"
        fieldLabel="Password"
        type="password"
      />

      <TextField
        fieldName="email"
        fieldLabel="Google Email"
      />

      <TextField
        fieldName="displayName"
        fieldLabel="Display name"
      />

      <KarkunSelectionField
        fieldName="karkun"
        fieldLabel="Karkun Name"
        showMsKarkunsList
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

export default WithBreadcrumbs(['Admin', 'Users', 'New'])(NewForm as any);
