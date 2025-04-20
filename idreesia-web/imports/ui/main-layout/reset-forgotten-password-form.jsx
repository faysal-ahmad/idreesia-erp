import React from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { Button, Card, Flex, Form, Input, message } from 'antd';

const itemLayout = {
  wrapperCol: { span: 14 },
};

const LoginFormButtonStyle = {
  marginBottom: '10px',
};

const FormWrapperStyle = {
  width: "300px",
  height: "200px",
  position: "absolute",
  top: "50%",
  left: "50%",
  marginTop: "-100px",
  marginLeft: "-150px",
};

export const ResetForgottenPasswordForm = ({  }) => {
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
      <Card title="Password Reset" style={{ minWidth: 400 }}>
        <Flex justify='center'>
          <Form form={form} onFinish={handleFinish}>
            <Form.Item
              {...itemLayout}
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
              {...itemLayout}
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
            <Button type="primary" htmlType="submit" style={LoginFormButtonStyle} block>
              Update Password
            </Button>
          </Form.Item>
          </Form>
        </Flex>
      </Card>
    </div>
  );
}

ResetForgottenPasswordForm.propTypes = {

};
