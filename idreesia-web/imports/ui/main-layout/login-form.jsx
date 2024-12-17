import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { Button, Card, Form, Input, message } from 'antd';
import { useMutation } from '@apollo/react-hooks';
import { GoogleOutlined } from '@ant-design/icons';

import { setLoggedInUserId } from 'meteor/idreesia-common/action-creators';

import { UPDATE_LOGIN_TIME } from './gql';

const FormStyle = {
  maxWidth: '300px',
};

const LoginFormButtonStyle = {
  marginBottom: '10px',
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

  return (
    <Card title="Login" style={{ minWidth: 400 }}>
      <Form style={FormStyle} onFinish={handleFinish}>
        <Form.Item
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
        <Form.Item>
          <Button type="primary" htmlType="submit" style={LoginFormButtonStyle} block>
            Log in
          </Button>
          <Button
            type="primary"
            style={LoginFormButtonStyle}
            onClick={handleLoginWithGoogle}
            block
          >
            <GoogleOutlined />
            Log in with Google
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

LoginForm.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default LoginForm;
