import React, { useEffect, useState } from 'react';
import { Button, Form, Input, SpinLoading } from 'antd-mobile';
import { useMutation } from '@apollo/client/react';
import { TwoFactorErrorCode } from 'meteor/idreesia-common/constants';
import { showError } from '../../layout';
import { Link } from '../../router';

import { ChatPaths } from '../../chat';
import { AuthLayout, PasswordInput } from '../../components';
import { MOBILE_UPDATE_LOGIN_TIME } from '../../gql';
import { getErrorCode, loginWithPassword } from '../accounts';
import { loadStoredDevice, type StoredDevice } from '../device-store';
import { PinLoginScreen } from './pin-login-screen';

interface LoginFormValues {
  userName: string;
  password: string;
}

interface CodeFormValues {
  code: string;
}

export const LoginScreen = () => {
  const [submitting, setSubmitting] = useState(false);
  // Set once the password is accepted for an account with two-factor
  // authentication on; the screen then asks for the authenticator app code.
  const [credentials, setCredentials] = useState<LoginFormValues | null>(null);
  const [codeForm] = Form.useForm<CodeFormValues>();
  const [updateLoginTime] = useMutation(MOBILE_UPDATE_LOGIN_TIME);
  // The device's quick-login credential: undefined while it loads, null when
  // there is none. With one, the PIN screen comes first.
  const [device, setDevice] = useState<StoredDevice | null | undefined>(undefined);
  const [usePassword, setUsePassword] = useState(false);

  useEffect(() => {
    loadStoredDevice()
      .then(setDevice)
      .catch(() => setDevice(null));
  }, []);

  const signIn = async (values: LoginFormValues, code?: string) => {
    const { userName, password } = values;
    setSubmitting(true);
    try {
      await loginWithPassword(userName, password, code);
      // Not awaited: signing in shouldn't fail if this bookkeeping call does.
      updateLoginTime().catch(() => undefined);
    } catch (error) {
      setSubmitting(false);
      const errorCode = getErrorCode(error);
      if (errorCode === TwoFactorErrorCode.CODE_REQUIRED) {
        setCredentials(values);
      } else if (errorCode === TwoFactorErrorCode.INVALID_CODE) {
        codeForm.resetFields();
        showError(null, 'Invalid verification code.');
      } else {
        showError(error, 'Login failed.');
      }
    }
  };

  const handleCodeFinish = ({ code }: CodeFormValues) => {
    if (credentials) signIn(credentials, code);
  };

  const handleCodeBack = () => {
    codeForm.resetFields();
    setCredentials(null);
  };

  if (device === undefined) {
    return (
      <div className="app-center">
        <SpinLoading color="primary" style={{ '--size': '40px' }} />
      </div>
    );
  }

  if (device && !usePassword) {
    return (
      <PinLoginScreen
        device={device}
        onDeviceLost={() => setDevice(null)}
        onUsePassword={() => setUsePassword(true)}
      />
    );
  }

  return (
    <AuthLayout
      footer={
        <>
          {device && (
            <Button fill="none" onClick={() => setUsePassword(false)}>
              Use PIN instead
            </Button>
          )}
          <Link to="/forgot-password">Forgot password?</Link>
          <span>
            Don&apos;t have an account? <Link to="/register">Register</Link>
          </span>
          <span>
            Need help? <Link to={ChatPaths.chat}>Message us</Link>
          </span>
        </>
      }
    >
      {credentials ? (
        <Form
          form={codeForm}
          layout="vertical"
          mode="card"
          onFinish={handleCodeFinish}
          footer={
            <>
              <Button block color="primary" loading={submitting} size="large" type="submit">
                Verify
              </Button>
              <Button block fill="none" size="large" onClick={handleCodeBack}>
                Back
              </Button>
            </>
          }
        >
          <Form.Header>Enter the 6-digit code from your authenticator app.</Form.Header>
          <Form.Item
            label="Verification code"
            name="code"
            rules={[{ required: true, message: 'Please enter the verification code.' }]}
          >
            <Input autoComplete="one-time-code" inputMode="numeric" maxLength={6} clearable />
          </Form.Item>
        </Form>
      ) : (
        <Form
          layout="vertical"
          mode="card"
          onFinish={(values: LoginFormValues) => signIn(values)}
          footer={
            <Button block color="primary" loading={submitting} size="large" type="submit">
              Sign in
            </Button>
          }
        >
          <Form.Item
            label="Email / Username"
            name="userName"
            rules={[{ required: true, message: 'Please enter your email or username.' }]}
          >
            <Input autoComplete="username" autoCapitalize="none" clearable />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please enter your password.' }]}
          >
            <PasswordInput autoComplete="current-password" />
          </Form.Item>
        </Form>
      )}
    </AuthLayout>
  );
};
