import { Meteor } from 'meteor/meteor';
import React, { type CSSProperties, useState } from 'react';
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
import { AndroidOutlined } from '@ant-design/icons';
import { message } from '/imports/ui/antd-feedback';
import { type History, type Location } from 'history';
import { useMutation } from '@apollo/client/react';

import { setLoggedInUserId } from 'meteor/idreesia-common/action-creators';
import { TwoFactorErrorCode } from 'meteor/idreesia-common/constants';

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

interface CodeFormValues {
  code: string;
}

const LoginFormButtonStyle: CSSProperties = {
  marginBottom: '10px',
  width: '100%',
};

const AndroidButtonStyle: CSSProperties = {
  height: 52,
  fontSize: 16,
  fontWeight: 600,
  background: '#3ddc84',
  borderColor: '#3ddc84',
  color: '#073b1e',
};

const { Link } = Typography;

// Stable URL: always the unversioned APK of the latest GitHub release.
const ANDROID_APK_URL =
  'https://github.com/faysal-ahmad/idreesia-erp/releases/latest/download/idreesia-mobile.apk';

export const LoginForm = ({ history, location, setShowForm }: Props) => {
  const dispatch = useDispatch();
  const [updateLoginTime] = useMutation(UPDATE_LOGIN_TIME);
  // Set once the password is accepted for an account with two-factor
  // authentication on; the form then asks for the authenticator app code.
  const [credentials, setCredentials] = useState<LoginFormValues | null>(null);
  const [codeForm] = Form.useForm<CodeFormValues>();

  const handleLoginResult = (values: LoginFormValues, error?: Error) => {
    if (!error) {
      history?.push(location?.pathname ?? '/');
      dispatch(setLoggedInUserId(Meteor.userId()));
      updateLoginTime();
      return;
    }

    const errorCode = (error as Meteor.Error).error;
    if (errorCode === TwoFactorErrorCode.CODE_REQUIRED) {
      setCredentials(values);
    } else if (errorCode === TwoFactorErrorCode.INVALID_CODE) {
      codeForm.resetFields();
      message.error('Invalid verification code.', 5);
    } else {
      message.error((error as Meteor.Error).reason ?? error.message, 5);
    }
  };

  const handleFinish = (values: LoginFormValues) => {
    const { userName, password } = values;
    (Meteor as any).loginWithPassword(userName, password, (error?: Error) =>
      handleLoginResult(values, error)
    );
  };

  const handleCodeFinish = ({ code }: CodeFormValues) => {
    if (!credentials) return;
    const { userName, password } = credentials;
    (Meteor as any).loginWithPasswordAnd2faCode(
      userName,
      password,
      code.trim(),
      (error?: Error) => handleLoginResult(credentials, error)
    );
  };

  const handleCodeCancel = () => {
    codeForm.resetFields();
    setCredentials(null);
  };

  const passwordStep = (
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
  );

  const codeStep = (
    <Form form={codeForm} onFinish={handleCodeFinish}>
      <Typography.Paragraph style={{ maxWidth: 320 }}>
        Enter the 6-digit code from your authenticator app.
      </Typography.Paragraph>
      <Form.Item
        name="code"
        rules={[
          {
            required: true,
            message: 'Please input the verification code.',
          },
        ]}
      >
        <Input
          autoFocus
          autoComplete="one-time-code"
          inputMode="numeric"
          maxLength={6}
          placeholder="Verification Code"
        />
      </Form.Item>
      <Form.Item>
        <Flex justify="space-between" gap="small">
          <Button
            type="primary"
            htmlType="submit"
            style={LoginFormButtonStyle}
            block
          >
            Verify
          </Button>
          <Button onClick={handleCodeCancel} style={LoginFormButtonStyle} block>
            Back
          </Button>
        </Flex>
      </Form.Item>
    </Form>
  );

  return (
    <Card
      title={
        <Flex align="center" gap={16}>
          <img
            src="/images/eb-logo-emblem.png"
            alt="Eastern Breeze"
            style={{ height: 100 }}
          />
          <span>Login to Eastern Breeze ERP</span>
        </Flex>
      }
      style={{ minWidth: 400 }}
    >
      <Flex justify="center">
        {credentials ? codeStep : passwordStep}
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
      {!credentials && (
        <>
          <Divider />
          <Flex vertical align="center" gap={8}>
            <Typography.Text type="secondary">
              Use Eastern Breeze ERP on your Android phone
            </Typography.Text>
            <Button
              type="primary"
              size="large"
              href={ANDROID_APK_URL}
              icon={<AndroidOutlined style={{ fontSize: 22 }} />}
              style={AndroidButtonStyle}
              block
            >
              Download Android app
            </Button>
          </Flex>
        </>
      )}
    </Card>
  );
};
