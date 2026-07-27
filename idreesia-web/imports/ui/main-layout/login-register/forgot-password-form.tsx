import React from 'react';
import PropTypes from 'prop-types';
import { Accounts } from "meteor/accounts-base";
import { Button, Card, Divider, Flex, Form, Input, Typography, message } from 'antd';

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

export const ForgotPasswordForm = ({ setShowForm }: BaseProps) => {
  const [form] = Form.useForm();

  const handleFinish = (values: Record<string, string>) => {
    const { email } = values;
    (Accounts as any).forgotPassword({
      email,
    }, (error?: Error) => {
      form.resetFields();
      if (error) {
        message.error(error.message, 5);
      } else {
        message.success('An email has been sent to the specified email address with further instructions.', 5);
      }
    });

  };

  return (
    <AntCard title="Reset Your Password" style={{ minWidth: 400 }}>
      <AntFlex justify='center'>
        <AntForm form={form} style={FormStyle as any} onFinish={handleFinish}>
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
              Reset Password
            </AntButton>
          </AntFormItem>
        </AntForm>
      </AntFlex>
      <AntDivider style={{ marginTop: 0 }} />
      <AntFlex justify='flex-end' gap='large'>
        <Link onClick={() => { setShowForm('login')}}>Login</Link>
        <Link onClick={() => { setShowForm('register')}}>Register</Link>
      </AntFlex>
    </AntCard>
  );
};

ForgotPasswordForm.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
  setShowForm: PropTypes.func,
};
