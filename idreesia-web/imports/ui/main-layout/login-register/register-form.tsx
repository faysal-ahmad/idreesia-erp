import React from 'react';
import PropTypes from 'prop-types';
import { Button, Card, Divider, Flex, Form, Input, Typography, message } from 'antd';
import { useMutation } from '@apollo/client/react';

import { REGISTER_USER } from '../gql';

const AntButton = Button as any;
const AntCard = Card as any;
const AntDivider = Divider as any;
const AntFlex = Flex as any;
const AntForm = Form as any;
const AntFormItem = (Form as any).Item;
const TextInput = Input as any;
const AntTypography = Typography as any;
const { Link } = AntTypography;
type ShowForm = 'login' | 'register' | 'forgot';
interface HistoryLike { push(path: string): void; }
interface LocationLike { pathname: string; }
interface BaseProps { history?: HistoryLike; location?: LocationLike; setShowForm(form: ShowForm): void; }

const FormStyle = {
  maxWidth: '300px',
};

const LoginFormButtonStyle = {
  marginBottom: '10px',
};

export const RegisterForm = ({ setShowForm }: BaseProps) => {
  const [form] = Form.useForm();
  const [registerUser] = useMutation(REGISTER_USER as any);

  const handleFinish = (values: Record<string, string>) => {
    const { displayName, email } = values;
    return registerUser({
      variables: {
        displayName,
        email,
      }
    })
    .then(() => {
      form.resetFields();
      message.success('An email has been sent to the specified email address with further instructions.', 5);
    })
    .catch((error?: Error) => {
      message.error(error?.message ?? 'Registration failed.', 5);
    });
  };

  return (
    <AntCard title="Register" style={{ minWidth: 400 }}>
      <AntFlex justify='center'>
        <AntForm form={form} style={FormStyle as any} onFinish={handleFinish}>
          <AntFormItem
            name="displayName"
            rules={[
              {
                required: true,
                message: 'Please input your name.',
              },
            ]}
          >
            <TextInput placeholder="Name" />
          </AntFormItem>
          <AntFormItem
            name="email"
            rules={[
              {
                required: true,
                message: 'Please input your email.',
              },
            ]}
          >
            <TextInput placeholder="Email" />
          </AntFormItem>
          <AntFormItem>
            <AntButton type="primary" htmlType="submit" style={LoginFormButtonStyle as any} block>
              Register
            </AntButton>
          </AntFormItem>
        </AntForm>
      </AntFlex>
      <AntDivider style={{ marginTop: 0 }} />
      <AntFlex justify='center'>
        <Link onClick={() => { setShowForm('login')}}>Already registered? Login</Link>
      </AntFlex>
    </AntCard>
  );
};

RegisterForm.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
  setShowForm: PropTypes.func,
};
