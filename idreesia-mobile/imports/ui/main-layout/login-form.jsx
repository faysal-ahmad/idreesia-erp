import React from 'react';
import PropTypes from 'prop-types';
import { createForm, formShape } from 'rc-form';
import { useDispatch } from 'react-redux';

import { setLoggedInUser } from 'meteor/idreesia-common/action-creators';

import {
  InputItemField,
  FormButtonsSaveCancel,
  List,
  Toast,
  WhiteSpace,
} from '/imports/ui/controls';

const LoginForm = ({
  history,
  form: { getFieldDecorator, getFieldError, validateFields },
}) => {
  const dispatch = useDispatch();

  const handleCancel = () => {
    history.goBack();
  };

  const handleLogin = () => {
    validateFields((err, values) => {
      if (!err) {
        const { userName, password } = values;
        Meteor.loginWithPassword(userName, password, error => {
          if (!error) {
            history.push('/');
            dispatch(setLoggedInUser(Meteor.user()));
          } else {
            Toast.fail('Login failed.', 2);
          }
        });
      }
    });
  };

  return (
    <List>
      <InputItemField
        fieldName="userName"
        placeholder="User name"
        getFieldError={getFieldError}
        getFieldDecorator={getFieldDecorator}
        required
      />
      <InputItemField
        fieldName="password"
        placeholder="Password"
        getFieldError={getFieldError}
        getFieldDecorator={getFieldDecorator}
        type="password"
        required
      />
      <WhiteSpace size="lg" />
      <FormButtonsSaveCancel
        saveText="Login"
        handleSave={handleLogin}
        handleCancel={handleCancel}
      />
    </List>
  );
};

LoginForm.propTypes = {
  history: PropTypes.object,
  form: formShape,
};

export default createForm()(LoginForm);
