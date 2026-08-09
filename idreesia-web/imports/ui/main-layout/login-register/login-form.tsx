import { Meteor } from 'meteor/meteor';
import React, { type CSSProperties } from 'react';
import { useDispatch } from 'react-redux';
import {
  Button,
  Card,
  Divider,
  Flex,
  Form,
  Input,
  Typography,
} from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { type History, type Location } from 'history';
import { useMutation } from '@apollo/client/react';

import { setLoggedInUserId } from 'meteor/idreesia-common/action-creators';

import { UPDATE_LOGIN_TIME } from '../gql';

type ShowForm = 'login' | 'register' | 'forgot';

interface Props {
  history?: History;
  location?: Location;
  setShowForm(form: ShowForm): void;
}

interface LoginFormValues {
  userName: string;
  password: string;
}

const LoginFormButtonStyle: CSSProperties = {
  marginBottom: '10px',
  width: '100%',
};

const { Link } = Typography;

export const LoginForm = ({ history, location, setShowForm }: Props) => {
  const dispatch = useDispatch();
  const [updateLoginTime] = useMutation(UPDATE_LOGIN_TIME);

  const handleFinish = (values: LoginFormValues) => {
    const { userName, password } = values;
    (Meteor as any).loginWithPassword(userName, password, (error?: Error) => {
      if (!error) {
        history?.push(location?.pathname ?? '/');
        dispatch(setLoggedInUserId(Meteor.userId()));
        updateLoginTime();
      } else {
        message.error(error.message, 5);
      }
    });
  };

  return (
    <Card title="Login to Idreesia" style={{ minWidth: 400 }}>
      <Flex justify="center">
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
            <Flex justify="space-between" gap="small">
              <Button
                type="primary"
                htmlType="submit"
                style={LoginFormButtonStyle}
                block
              >
                Log in
              </Button>
              <Button
                onClick={() => {
                  setShowForm('forgot');
                }}
                style={LoginFormButtonStyle}
                block
              >
                Forgot Password
              </Button>
            </Flex>
          </Form.Item>
        </Form>
      </Flex>
      <Divider style={{ marginTop: 0 }} />
      <Flex justify="center">
        <Link
          onClick={() => {
            setShowForm('register');
          }}
        >
          Don't have an account? Register
        </Link>
      </Flex>
    </Card>
  );
};
