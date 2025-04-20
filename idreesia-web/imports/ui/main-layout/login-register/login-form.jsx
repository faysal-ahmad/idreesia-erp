import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { Button, Card, Divider, Flex, Form, Input, Space, Typography, message } from 'antd';
import { useMutation } from '@apollo/react-hooks';
import { GoogleOutlined } from '@ant-design/icons';

import { setLoggedInUserId } from 'meteor/idreesia-common/action-creators';

import { UPDATE_LOGIN_TIME } from '../gql';

const { Link } = Typography;

const LoginFormButtonStyle = {
  marginBottom: '10px',
  width: '100%',
};

export const LoginForm = ({ history, location, setShowForm }) => {
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
    <Card title="Login to Idreesia" style={{ minWidth: 400 }}>
      <Flex justify='center'>
        <Form onFinish={handleFinish}>
          <Form.Item
            name="userName"
            rules={[
              {
                required: true,
                message: 'Please input your email or username.',
              },
            ]}
          >
            <Input placeholder="Email / Username" />
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
            <Flex justify='space-between' gap='small'>
              <Button type="primary" htmlType="submit" style={LoginFormButtonStyle} block>
                Log in
              </Button>
              <Button onClick={() => { setShowForm('forgot')}} style={LoginFormButtonStyle} block>
                Forgot Password
              </Button>
            </Flex>
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
      </Flex>
      <Divider style={{ marginTop: 0 }} />
      <Flex justify='center'>
        <Link onClick={() => { setShowForm('register')}}>Don't have an account? Register</Link>
      </Flex>
    </Card>
  );
};

LoginForm.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
  setShowForm: PropTypes.func,
};
