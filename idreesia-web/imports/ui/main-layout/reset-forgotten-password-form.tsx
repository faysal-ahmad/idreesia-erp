import { Accounts } from 'meteor/accounts-base';
import React, { type CSSProperties } from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';
import { Button, Card, Divider, Flex, Form, Input } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import { TwoFactorErrorCode } from 'meteor/idreesia-common/constants';

const FormButtonStyle: CSSProperties = {
  marginBottom: '10px',
};

const FormWrapperStyle: CSSProperties = {
  width: '300px',
  height: '200px',
  position: 'absolute',
  top: '50%',
  left: '50%',
  marginTop: '-100px',
  marginLeft: '-150px',
};

interface FormValues {
  newPassword: string;
  confirmedNewPassword: string;
}

export const ResetForgottenPasswordForm = () => {
  const [form] = Form.useForm<FormValues>();
  const { token } = useParams<{ token: string }>();
  const history = useHistory();

  const handleFinish = (values: FormValues) => {
    const { newPassword, confirmedNewPassword } = values;
    if (newPassword === confirmedNewPassword) {
      (Accounts as any).resetPassword(token, newPassword, (error?: Error) => {
        if (!error) return;
        // With two-factor authentication on, the password is changed but the
        // user isn't logged in automatically; they log in with a code.
        if ((error as Meteor.Error).error === TwoFactorErrorCode.LOGIN_SKIPPED) {
          message.success('Your password has been changed. Please log in.', 5);
          history.push('/');
          return;
        }
        message.error((error as Meteor.Error).reason ?? error.message, 5);
      });
    }
  };

  return (
    <div style={FormWrapperStyle}>
      <Card title="Set New Password" style={{ minWidth: 400 }}>
        <Flex justify="center">
          <Form form={form} onFinish={handleFinish}>
            <Form.Item
              name="newPassword"
              rules={[
                {
                  required: true,
                  message: 'Please input your new password.',
                },
              ]}
            >
              <Input type="password" placeholder="New Password" />
            </Form.Item>
            <Form.Item
              name="confirmedNewPassword"
              rules={[
                {
                  required: true,
                  message: 'Please confirm your new password.',
                },
              ]}
            >
              <Input type="password" placeholder="Confirm New Password" />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                style={FormButtonStyle}
                block
              >
                Set Password
              </Button>
            </Form.Item>
          </Form>
        </Flex>
        <Divider style={{ marginTop: 0 }} />
        <Flex justify="flex-end">
          <Link to="/">Back to Login</Link>
        </Flex>
      </Card>
    </div>
  );
};
