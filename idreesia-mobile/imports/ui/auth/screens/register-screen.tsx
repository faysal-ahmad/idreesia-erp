import React, { useState } from 'react';
import { Button, Form, Input, Result, Toast } from 'antd-mobile';
import { useMutation } from '@apollo/client/react';
import { Link, useHistory } from '../../router';

import { AuthLayout } from '../../components';
import { MOBILE_REGISTER_USER } from '../../gql';
import { getErrorMessage } from '../accounts';

interface RegisterFormValues {
  displayName: string;
  email: string;
}

export const RegisterScreen = () => {
  const history = useHistory();
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [registerUser, { loading }] = useMutation(MOBILE_REGISTER_USER);

  const handleFinish = async (values: RegisterFormValues) => {
    const { displayName, email } = values;
    try {
      await registerUser({
        variables: { displayName: displayName.trim(), email: email.trim() },
      });
      setRegisteredEmail(email.trim());
    } catch (error) {
      Toast.show({
        icon: 'fail',
        content: getErrorMessage(error, 'Registration failed.'),
      });
    }
  };

  if (registeredEmail) {
    return (
      <AuthLayout title="Check your email">
        <Result
          status="success"
          title="Registration received"
          description={`We sent an email to ${registeredEmail}. Open the link in it to set your password, then sign in here.`}
        />
        <Button block color="primary" size="large" onClick={() => history.push('/login')}>
          Back to sign in
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Register"
      subtitle="We'll email you a link to set your password."
      footer={
        <span>
          Already registered? <Link to="/login">Sign in</Link>
        </span>
      }
    >
      <Form
        layout="vertical"
        mode="card"
        onFinish={handleFinish}
        footer={
          <Button block color="primary" loading={loading} size="large" type="submit">
            Register
          </Button>
        }
      >
        <Form.Item
          label="Name"
          name="displayName"
          rules={[{ required: true, whitespace: true, message: 'Please enter your name.' }]}
        >
          <Input autoComplete="name" clearable />
        </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please enter your email.' },
            { type: 'email', message: 'Please enter a valid email.' },
          ]}
        >
          <Input autoCapitalize="none" autoComplete="email" clearable type="email" />
        </Form.Item>
      </Form>
    </AuthLayout>
  );
};
