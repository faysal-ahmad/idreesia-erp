import { Accounts } from 'meteor/accounts-base';
import React, { type CSSProperties } from 'react';
import { Link, useParams } from 'react-router-dom';
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
  top: '40%',
  left: '45%',
  marginTop: '-100px',
  marginLeft: '-150px',
};

// Error code the server's login check throws for a locked account
// (idreesia-web/imports/startup/server/account-lock.ts). Self-registered
// accounts start locked, so setting the password succeeds but the automatic
// login that follows is refused.
const ACCOUNT_LOCKED_ERROR = 'account-locked';

interface FormValues {
  newPassword: string;
  confirmedNewPassword: string;
}

export const SetInitialPasswordForm = () => {
  const [form] = Form.useForm<FormValues>();
  const { token } = useParams<{ token: string }>();

  const handleFinish = (values: FormValues) => {
    const { newPassword, confirmedNewPassword } = values;
    if (newPassword === confirmedNewPassword) {
      (Accounts as any).resetPassword(token, newPassword, (error?: Error) => {
        if (!error) return;
        if ((error as Meteor.Error).error === ACCOUNT_LOCKED_ERROR) {
          form.resetFields();
          message.warning(
            'Your password has been updated, but your account is currently locked and needs an administrator\'s approval.',
            10
          );
          return;
        }
        if ((error as Meteor.Error).error === TwoFactorErrorCode.LOGIN_SKIPPED) {
          form.resetFields();
          message.success('Your password has been set. Please log in.', 5);
          return;
        }
        message.error((error as Meteor.Error).reason ?? error.message, 5);
      });
    }
  };

  return (
    <div style={FormWrapperStyle}>
      <Card title="Set Account Password" style={{ minWidth: 400 }}>
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
