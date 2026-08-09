import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import React from 'react';
import { Form, Input, Modal } from 'antd';
import { message } from '/imports/ui/antd-feedback';
const itemLayout = {
  wrapperCol: { span: 14 },
};

interface Props {
  showForm?: boolean;
  handlePasswordChanged(): void;
  handlePasswordChangeCancelled(): void;
}

interface FormValues {
  oldPassword: string;
  newPassword: string;
}

const ChangePasswordForm = ({
  showForm,
  handlePasswordChanged,
  handlePasswordChangeCancelled,
}: Props) => {
  const [form] = Form.useForm<FormValues>();

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const { oldPassword, newPassword } = values;
      (Accounts as any).changePassword(
        oldPassword,
        newPassword,
        (error?: Error) => {
          if (!error) {
            (Meteor as any).logoutOtherClients();
            message.success('Your password has been changed.', 5);
            handlePasswordChanged();
          } else {
            message.error(error.message, 5);
          }
        }
      );
    });
  };

  return (
    <Modal
      title="Change Password"
      open={showForm}
      onOk={handleSubmit}
      onCancel={handlePasswordChangeCancelled}
    >
      <Form form={form}>
        <Form.Item
          {...itemLayout}
          name="oldPassword"
          rules={[
            {
              required: true,
              message: 'Please input your old password.',
            },
          ]}
        >
          <Input type="password" placeholder="Old Password" />
        </Form.Item>
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
      </Form>
    </Modal>
  );
};

export default ChangePasswordForm;
