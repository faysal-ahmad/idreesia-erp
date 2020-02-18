import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useMutation } from '@apollo/react-hooks';

import { setLoggedInUserId } from 'meteor/idreesia-common/action-creators';

import { Button, Form, Icon, Input, message } from './antd-controls';
import { UPDATE_LOGIN_TIME } from './gql';

const loginFormButtonStyle = {
  width: '100%',
};

const LoginForm = ({ history, location, form }) => {
  const dispatch = useDispatch();
  const [updateLoginTime] = useMutation(UPDATE_LOGIN_TIME);

  const handleSubmit = e => {
    e.preventDefault();
    form.validateFields((err, values) => {
      if (!err) {
        const { userName, password } = values;
        Meteor.loginWithPassword(userName, password, error => {
          if (!error) {
            history.push(location.pathname);
            dispatch(setLoggedInUserId(Meteor.userId()));
            updateLoginTime();
          } else {
            message.error(error.message, 5);
          }
        });
      }
    });
  };

  const handleLoginWithGoogle = () => {
    const options = {
      requestPermissions: ['email'],
    };

    Meteor.loginWithGoogle(options, error => {
      if (!error) {
        history.push(location.pathname);
        dispatch(setLoggedInUserId(Meteor.userId()));
        updateLoginTime();
      } else {
        message.error(error.message, 5);
      }
    });
  };

  const getUserNameField = () => {
    const rules = [
      {
        required: true,
        message: 'Please input your username.',
      },
    ];
    return form.getFieldDecorator('userName', { rules })(
      <Input placeholder="Username" />
    );
  };

  const getPasswordField = () => {
    const rules = [
      {
        required: true,
        message: 'Please input your password.',
      },
    ];
    return form.getFieldDecorator('password', { rules })(
      <Input type="password" placeholder="Password" />
    );
  };

  const itemLayout = {
    wrapperCol: { span: 14 },
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Item {...itemLayout}>{getUserNameField()}</Form.Item>
      <Form.Item {...itemLayout}>{getPasswordField()}</Form.Item>
      <Form.Item {...itemLayout}>
        <Button type="primary" htmlType="submit" style={loginFormButtonStyle}>
          Log in
        </Button>
        <Button
          type="primary"
          style={loginFormButtonStyle}
          onClick={handleLoginWithGoogle}
        >
          <Icon type="google" style={{ fontSize: 20 }} />
          Log in with Google
        </Button>
      </Form.Item>
    </Form>
  );
};

LoginForm.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
  form: PropTypes.object,
};

export default Form.create()(LoginForm);
