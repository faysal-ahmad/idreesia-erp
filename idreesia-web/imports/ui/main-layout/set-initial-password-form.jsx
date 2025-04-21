import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Card, Divider, Flex, Form, Input, message } from 'antd';

const FormButtonStyle = {
  marginBottom: '10px',
};

const FormWrapperStyle = {
  width: "300px",
  height: "200px",
  position: "absolute",
  top: "40%",
  left: "45%",
  marginTop: "-100px",
  marginLeft: "-150px",
};

export const SetInitialPasswordForm = ({}) => {
  const [form] = Form.useForm();
  const { token } = useParams();

  const handleFinish = values => {
    const { newPassword, confirmedNewPassword } = values;
    if (newPassword === confirmedNewPassword) {
      Accounts.resetPassword(token, newPassword, (error) => {
        if (error) {
          message.error(error.message, 5);
        }
      });
    }
  };

  return (
    <div style={FormWrapperStyle}>
      <Card title="Set Account Password" style={{ minWidth: 400 }}>
        <Flex justify='center'>
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
            <Button type="primary" htmlType="submit" style={FormButtonStyle} block>
              Set Password
            </Button>
          </Form.Item>
          </Form>
        </Flex>
        <Divider style={{ marginTop: 0 }} />
        <Flex justify='flex-end'>
          <Link to="/">Back to Login</Link>
        </Flex>
      </Card>
    </div>
  );
}
