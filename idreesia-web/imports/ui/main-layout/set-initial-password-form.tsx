import { Accounts } from 'meteor/accounts-base';
import React, { type CSSProperties } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Card, Divider, Flex, Form, Input } from 'antd';
import { message } from '/imports/ui/antd-feedback';

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

const RouterLink = Link as any;

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
        if (error) {
          message.error(error.message, 5);
        }
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
          <RouterLink to="/">Back to Login</RouterLink>
        </Flex>
      </Card>
    </div>
  );
};
