import React from 'react';
import PropTypes from 'prop-types';
import { Button, Card, Divider, Flex, Form, Input, Typography, message } from 'antd';
import { useMutation } from '@apollo/react-hooks';

import { REGISTER_USER } from '../gql';

const { Link } = Typography;

const FormStyle = {
  maxWidth: '300px',
};

const LoginFormButtonStyle = {
  marginBottom: '10px',
};

export const RegisterForm = ({ history, location, setShowForm }) => {
  const [form] = Form.useForm();
  const [registerUser] = useMutation(REGISTER_USER);

  const handleFinish = values => {
    const { displayName, email } = values;
    return registerUser({
      variables: {
        displayName,
        email,
      }
    })
    .then(() => {
      form.resetFields();
      message.success('An email has been sent to the specified email address with further instructions.');
    })
    .catch(error => {
      message.error(error.message, 5);
    });
  };

  return (
    <Card title="Register" style={{ minWidth: 400 }}>
      <Flex justify='center'>
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
            <Button type="primary" htmlType="submit" style={LoginFormButtonStyle} block>
              Register
            </Button>
          </Form.Item>
        </Form>
      </Flex>
      <Divider style={{ marginTop: 0 }} />
      <Flex justify='center'>
        <Link onClick={() => { setShowForm('login')}}>Already registered? Login</Link>
      </Flex>
    </Card>
  );
};

RegisterForm.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
  setShowForm: PropTypes.func,
};
