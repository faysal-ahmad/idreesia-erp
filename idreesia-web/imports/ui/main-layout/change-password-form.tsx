import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import React from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Modal, message } from 'antd';

const itemLayout = {
  wrapperCol: { span: 14 },
};

const AntForm = Form as any;
const AntFormItem = (Form as any).Item;
const TextInput = Input as any;
const AntModal = Modal as any;
interface Props { showForm?: boolean; handlePasswordChanged(): void; handlePasswordChangeCancelled(): void; }
interface FormValues { oldPassword: string; newPassword: string; }

const ChangePasswordForm = ({ showForm, handlePasswordChanged, handlePasswordChangeCancelled }: Props) => {
  const [form] = AntForm.useForm();

  const handleSubmit = () => {
    form.validateFields().then((values: FormValues) => {
      const { oldPassword, newPassword } = values;
      (Accounts as any).changePassword(oldPassword, newPassword, (error?: Error) => {
        if (!error) {
          (Meteor as any).logoutOtherClients();
          message.success('Your password has been changed.', 5);
          handlePasswordChanged();
        } else {
          message.error(error.message, 5);
        }
      })
    });
  };

  return (
    <AntModal
      title="Change Password"
      open={showForm}
      onOk={handleSubmit}
      onCancel={handlePasswordChangeCancelled}
    >
      <AntForm form={form}>
        <AntFormItem
          {...itemLayout}
          name="oldPassword"
          rules={[
            {
              required: true,
              message: 'Please input your old password.',
            },
          ]}
        >
          <TextInput type="password" placeholder="Old Password" />
        </AntFormItem>
        <AntFormItem
          {...itemLayout}
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
      </AntForm>
    </AntModal>
  );
}

ChangePasswordForm.propTypes = {
  showForm: PropTypes.bool,
  handlePasswordChanged: PropTypes.func,
  handlePasswordChangeCancelled: PropTypes.func,
};

export default ChangePasswordForm;
