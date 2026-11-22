import React, { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { Form, Input, Modal } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import { RESET_USER_PASSWORD } from '../gql';

interface Props {
  userId: string;
  /** The modal is open while this is true. */
  open: boolean;
  onClose(): void;
}

const ResetPasswordModal = ({ userId, open, onClose }: Props) => {
  const [password, setPassword] = useState('');
  const [resetPassword, { loading }] = useMutation(RESET_USER_PASSWORD);

  const handleClose = () => {
    setPassword('');
    onClose();
  };

  const handleUpdate = () => {
    if (!password) return;
    resetPassword({ variables: { userId, password } })
      .then(() => {
        message.success('Password updated', 2);
        handleClose();
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  return (
    <Modal
      title="Reset Password"
      open={open}
      okText="Update"
      okButtonProps={{ disabled: !password }}
      confirmLoading={loading}
      onOk={handleUpdate}
      onCancel={handleClose}
      destroyOnHidden
    >
      <Form layout="vertical" style={{ width: '100%' }} onFinish={handleUpdate}>
        <Form.Item label="New password" required>
          <Input.Password
            autoFocus
            autoComplete="new-password"
            value={password}
            onChange={event => setPassword(event.target.value)}
            onPressEnter={handleUpdate}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ResetPasswordModal;
