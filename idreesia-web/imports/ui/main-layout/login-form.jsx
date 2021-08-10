import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useMutation } from '@apollo/react-hooks';
import { GoogleOutlined } from '@ant-design/icons';

import { setLoggedInUserId } from 'meteor/idreesia-common/action-creators';

import { Button, Form, Input, message } from './antd-controls';
import { UPDATE_LOGIN_TIME } from './gql';

const IconStyle = {
  fontSize: '20px',
};

const LoginFormButtonStyle = {
  width: '100%',
};

const LoginForm = ({ history, location }) => {
  const dispatch = useDispatch();
  const [updateLoginTime] = useMutation(UPDATE_LOGIN_TIME);

  const handleFinish = values => {
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

  const itemLayout = {
    wrapperCol: { span: 14 },
  };

  return (
    <Form onFinish={handleFinish}>
      <Form.Item
        {...itemLayout}
        name="userName"
        rules={[
          {
            required: true,
            message: 'Please input your username.',
          },
        ]}
      >
        <Input placeholder="Username" />
      </Form.Item>
      <Form.Item
        {...itemLayout}
        name="password"
        rules={[
          {
            required: true,
            message: 'Please input your password.',
          },
        ]}
      >
        <Input type="password" placeholder="Password" />
      </Form.Item>
      <Form.Item {...itemLayout}>
        <Button type="primary" htmlType="submit" style={LoginFormButtonStyle}>
          Log in
        </Button>
        <Button
          type="primary"
          style={LoginFormButtonStyle}
          onClick={handleLoginWithGoogle}
        >
          <GoogleOutlined style={IconStyle} />
          Log in with Google
        </Button>
      </Form.Item>
    </Form>
  );
};

LoginForm.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default LoginForm;
