import React, { useState } from 'react';
import { Button, Form, Input, Toast } from 'antd-mobile';
import { useMutation } from '@apollo/client/react';
import { Link } from '../../router';

import { AuthLayout, PasswordInput } from '../../components';
import { MOBILE_UPDATE_LOGIN_TIME } from '../../gql';
import { getErrorMessage, loginWithPassword } from '../accounts';

interface LoginFormValues {
  userName: string;
  password: string;
}

export const LoginScreen = () => {
  const [submitting, setSubmitting] = useState(false);
  const [updateLoginTime] = useMutation(MOBILE_UPDATE_LOGIN_TIME);

  const handleFinish = async (values: LoginFormValues) => {
    const { userName, password } = values;
    setSubmitting(true);
    try {
      await loginWithPassword(userName, password);
      // Not awaited: signing in shouldn't fail if this bookkeeping call does.
      updateLoginTime().catch(() => undefined);
    } catch (error) {
      Toast.show({ icon: 'fail', content: getErrorMessage(error, 'Login failed.') });
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      footer={
        <>
          <Link to="/forgot-password">Forgot password?</Link>
          <span>
            Don&apos;t have an account? <Link to="/register">Register</Link>
          </span>
        </>
      }
    >
      <Form
        layout="vertical"
        mode="card"
        onFinish={handleFinish}
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
    </AuthLayout>
  );
};
