import React, { type CSSProperties } from 'react';
import { Accounts } from 'meteor/accounts-base';
import {
  Button,
  Card,
  Divider,
  Flex,
  Form,
  Input,
  Typography,
  message,
} from 'antd';

type ShowForm = 'login' | 'register' | 'forgot';

interface Props {
  setShowForm(form: ShowForm): void;
}

interface ForgotPasswordFormValues {
  email: string;
}

const FormStyle: CSSProperties = {
  maxWidth: '300px',
};

const LoginFormButtonStyle: CSSProperties = {
  marginBottom: '10px',
};

const { Link } = Typography;

export const ForgotPasswordForm = ({ setShowForm }: Props) => {
  const [form] = Form.useForm<ForgotPasswordFormValues>();

  const handleFinish = (values: ForgotPasswordFormValues) => {
    const { email } = values;
    (Accounts as any).forgotPassword({ email }, (error?: Error) => {
      form.resetFields();
      if (error) {
        message.error(error.message, 5);
      } else {
        message.success(
          'An email has been sent to the specified email address with further instructions.',
          5
        );
      }
    });
  };

  return (
    <Card title="Reset Your Password" style={{ minWidth: 400 }}>
      <Flex justify="center">
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
            <Button
              type="primary"
              htmlType="submit"
              style={LoginFormButtonStyle}
              block
            >
              Reset Password
            </Button>
          </Form.Item>
        </Form>
      </Flex>
      <Divider style={{ marginTop: 0 }} />
      <Flex justify="flex-end" gap="large">
        <Link
          onClick={() => {
            setShowForm('login');
          }}
        >
          Login
        </Link>
        <Link
          onClick={() => {
            setShowForm('register');
          }}
        >
          Register
        </Link>
      </Flex>
    </Card>
  );
};
