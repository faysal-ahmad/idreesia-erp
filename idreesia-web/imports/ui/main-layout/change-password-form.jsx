import { Meteor } from 'meteor/meteor';
import React from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Modal, message } from './antd-controls';

const itemLayout = {
  wrapperCol: { span: 14 },
};

const ChangePasswordForm = ({ showForm, handlePasswordChanged, handlePasswordChangeCancelled }) => {
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then(values => {
      const { oldPassword, newPassword } = values;
      Accounts.changePassword(oldPassword, newPassword, error => {
        if (!error) {
          Meteor.logoutOtherClients();
          message.success('Your password has been changed.', 5);
          handlePasswordChanged();
        } else {
          message.error(error.message, 5);
        }
      })
    });
  };

  return (
    <Modal
      title="Change Password"
      visible={showForm}
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
}

ChangePasswordForm.propTypes = {
  showForm: PropTypes.bool,
  handlePasswordChanged: PropTypes.func,
  handlePasswordChangeCancelled: PropTypes.func,
};

export default ChangePasswordForm;
