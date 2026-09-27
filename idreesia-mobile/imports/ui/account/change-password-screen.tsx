import React, { useState } from 'react';
import { Button, Form, Toast } from 'antd-mobile';

import { changePassword, getErrorMessage } from '../auth/accounts';
import { PasswordInput } from '../components';
import { Page, useNavigateBack } from '../layout';
import { AccountPaths } from './paths';

interface ChangePasswordFormValues {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const ChangePasswordScreen = () => {
  const navigateBack = useNavigateBack(AccountPaths.account);
  const [submitting, setSubmitting] = useState(false);

  const handleFinish = async (values: ChangePasswordFormValues) => {
    const { oldPassword, newPassword } = values;
    setSubmitting(true);
    try {
      await changePassword(oldPassword, newPassword);
      Toast.show({ icon: 'success', content: 'Your password has been changed.' });
      navigateBack();
    } catch (error) {
      Toast.show({
        icon: 'fail',
        content: getErrorMessage(error, 'Could not change your password.'),
      });
      setSubmitting(false);
    }
  };

  return (
    <Page backTo={AccountPaths.account} title="Change password">
        <p className="page-hint">
          Changing your password signs you out everywhere else, including the web app.
        </p>
        <Form
          layout="vertical"
          mode="card"
          onFinish={handleFinish}
          footer={
            <Button block color="primary" loading={submitting} size="large" type="submit">
              Change password
            </Button>
          }
        >
          <Form.Item
            label="Current password"
            name="oldPassword"
            rules={[{ required: true, message: 'Please enter your current password.' }]}
          >
            <PasswordInput autoComplete="current-password" />
          </Form.Item>
          <Form.Item
            label="New password"
            name="newPassword"
            rules={[{ required: true, message: 'Please enter a new password.' }]}
          >
            <PasswordInput autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            dependencies={['newPassword']}
            label="Confirm new password"
            name="confirmPassword"
            rules={[
              { required: true, message: 'Please confirm your new password.' },
              ({ getFieldValue }) => ({
                validator: (_rule, value) =>
                  !value || value === getFieldValue('newPassword')
                    ? Promise.resolve()
                    : Promise.reject(new Error('The passwords do not match.')),
              }),
            ]}
          >
            <PasswordInput autoComplete="new-password" />
          </Form.Item>
        </Form>
    </Page>
  );
};
