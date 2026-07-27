import { Accounts } from 'meteor/accounts-base';
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
  top: "50%",
  left: "50%",
  marginTop: "-100px",
  marginLeft: "-150px",
};

const RouterLink = Link as any;
const AntButton = Button as any;
const AntCard = Card as any;
const AntDivider = Divider as any;
const AntFlex = Flex as any;
const AntForm = Form as any;
const AntFormItem = (Form as any).Item;
const TextInput = Input as any;
interface FormValues { newPassword: string; confirmedNewPassword: string; }

export const ResetForgottenPasswordForm = () => {
  const [form] = AntForm.useForm();
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
    <div style={FormWrapperStyle as any}>
      <AntCard title="Set New Password" style={{ minWidth: 400 }}>
        <AntFlex justify='center'>
          <AntForm form={form} onFinish={handleFinish}>
            <AntFormItem
              name="newPassword"
              rules={[
                {
                  required: true,
                  message: 'Please input your new password.',
                },
              ]}
            >
              <TextInput type="password" placeholder="New Password" />
            </AntFormItem>
            <AntFormItem
              name="confirmedNewPassword"
              rules={[
                {
                  required: true,
                  message: 'Please confirm your new password.',
                },
              ]}
            >
              <TextInput type="password" placeholder="Confirm New Password" />
            </AntFormItem>
            <AntFormItem>
            <AntButton type="primary" htmlType="submit" style={FormButtonStyle} block>
              Set Password
            </AntButton>
          </AntFormItem>
          </AntForm>
        </AntFlex>
        <AntDivider style={{ marginTop: 0 }} />
        <AntFlex justify='flex-end'>
          <RouterLink to="/">Back to Login</RouterLink>
        </AntFlex>
      </AntCard>
    </div>
  );
}
