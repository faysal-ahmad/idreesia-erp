import React, { type CSSProperties } from 'react';
import { Button, Card, Divider, Flex, Form, Input, Typography, message } from 'antd';
import { useMutation } from '@apollo/client/react';

import { REGISTER_USER } from '../gql';

type ShowForm = 'login' | 'register' | 'forgot';

interface Props {
  setShowForm(form: ShowForm): void;
}

interface RegisterFormValues {
  displayName: string;
  email: string;
}

const FormStyle: CSSProperties = {
  maxWidth: '300px',
};

const LoginFormButtonStyle: CSSProperties = {
  marginBottom: '10px',
};

const { Link } = Typography;

export const RegisterForm = ({ setShowForm }: Props) => {
  const [form] = Form.useForm<RegisterFormValues>();
  const [registerUser] = useMutation(REGISTER_USER);

  const handleFinish = (values: RegisterFormValues) => {
    const { displayName, email } = values;
    return registerUser({
      variables: {
        displayName,
        email,
      },
    })
      .then(() => {
        form.resetFields();
        message.success(
          'An email has been sent to the specified email address with further instructions.',
          5
        );
      })
      .catch((error: Error) => {
        message.error(error?.message ?? 'Registration failed.', 5);
      });
  };

  return (
    <Card title="Register" style={{ minWidth: 400 }}>
      <Flex justify="center">
        <Form form={form} style={FormStyle} onFinish={handleFinish}>
          <Form.Item
            name="displayName"
            rules={[
              {
                required: true,
                message: 'Please input your name.',
              },
            ]}
          >
            <Input placeholder="Name" />
          </Form.Item>
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
              Register
            </Button>
          </Form.Item>
        </Form>
      </Flex>
      <Divider style={{ marginTop: 0 }} />
      <Flex justify="center">
        <Link
          onClick={() => {
            setShowForm('login');
          }}
        >
          Already registered? Login
        </Link>
      </Flex>
    </Card>
  );
};
