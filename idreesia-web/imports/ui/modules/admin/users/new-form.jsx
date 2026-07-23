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

const NewForm = ({ history }) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const formRef = useRef(null);
  const [createUser] = useMutation(CREATE_USER, {
    refetchQueries: [{ query: PAGED_USERS, variables: { filter: {} } }],
  });

  const handleCancel = () => {
    history.goBack();
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ karkun, userName, password, email, displayName }) => {
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
        .catch(error => {
          message.error(error.message, 5);
        });
    } else {
      formRef.current.setFields([
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
    <Form ref={formRef} layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
      <InputTextField
        fieldName="userName"
        fieldLabel="User name"
      />

      <InputTextField
        fieldName="password"
        fieldLabel="Password"
        type="password"
      />

      <InputTextField
        fieldName="email"
        fieldLabel="Google Email"
      />

      <InputTextField
        fieldName="displayName"
        fieldLabel="Display name"
      />

      <KarkunSelectionInputField
        fieldName="karkun"
        fieldLabel="Karkun Name"
        showMsKarkunsList
      />

      <FormButtonsSaveCancel
        handleCancel={handleCancel}
        isFieldsTouched={isFieldsTouched}
      />
    </Form>
  );
};

NewForm.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default WithBreadcrumbs(['Admin', 'Users', 'New'])(NewForm);
