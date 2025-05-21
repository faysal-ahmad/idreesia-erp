import React from 'react';
import PropTypes from 'prop-types';
import { Accounts } from "meteor/accounts-base";
import { Button, Card, Divider, Flex, Form, Input, Typography, message } from 'antd';

const { Link } = Typography;

const FormStyle = {
  maxWidth: '300px',
};

const LoginFormButtonStyle = {
  marginBottom: '10px',
};

export const ForgotPasswordForm = ({ history, location, setShowForm }) => {
  const [form] = Form.useForm();

  const handleFinish = values => {
    const { email } = values;
    Accounts.forgotPassword({
      email,
    }, (error) => {
      form.resetFields();
      if (error) {
        message.error(error.message, 5);
      } else {
        message.success('An email has been sent to the specified email address with further instructions.', 5);
      }
    });

  };

  return (
    <Card title="Reset Your Password" style={{ minWidth: 400 }}>
      <Flex justify='center'>
        <Form form={form} style={FormStyle} onFinish={handleFinish}>
          <Form.Item
            name="email"
            rules={[
              {
                required: true,
                message: 'Please input your email.',
              },
            ]}
          >
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={LoginFormButtonStyle} block>
              Reset Password
            </Button>
          </Form.Item>
        </Form>
      </Flex>
      <Divider style={{ marginTop: 0 }} />
      <Flex justify='flex-end' gap='large'>
        <Link onClick={() => { setShowForm('login')}}>Login</Link>
        <Link onClick={() => { setShowForm('register')}}>Register</Link>
      </Flex>
    </Card>
  );
};

ForgotPasswordForm.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
  setShowForm: PropTypes.func,
};
