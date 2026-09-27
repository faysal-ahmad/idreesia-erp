import React, { useState } from 'react';
import { Button, Form, Input, Result, Toast } from 'antd-mobile';
import { Link, useHistory } from '../../router';

import { AuthLayout } from '../../components';
import { forgotPassword, getErrorMessage } from '../accounts';

interface ForgotPasswordFormValues {
  email: string;
}

export const ForgotPasswordScreen = () => {
  const history = useHistory();
  const [submitting, setSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const handleFinish = async (values: ForgotPasswordFormValues) => {
    const { email } = values;
    setSubmitting(true);
    try {
      await forgotPassword(email);
      setSentTo(email.trim());
    } catch (error) {
      Toast.show({
        icon: 'fail',
        content: getErrorMessage(error, 'Could not send the reset email.'),
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (sentTo) {
    return (
      <AuthLayout title="Check your email">
        <Result
          status="success"
          title="Reset link sent"
          description={`We sent an email to ${sentTo}. Open the link in it to choose a new password, then sign in here.`}
        />
        <Button block color="primary" size="large" onClick={() => history.push('/login')}>
          Back to sign in
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Enter the email address on your account and we'll send you a reset link."
      footer={<Link to="/login">Back to sign in</Link>}
    >
      <Form
        layout="vertical"
        mode="card"
        onFinish={handleFinish}
        footer={
          <Button block color="primary" loading={submitting} size="large" type="submit">
            Send reset link
          </Button>
        }
      >
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
