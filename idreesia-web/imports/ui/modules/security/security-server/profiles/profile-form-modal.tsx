import React, { useEffect } from 'react';
import { Button, Form, Input, Modal, Switch } from 'antd';

export interface ProfileFormValues {
  name: string;
  isTest: boolean;
}

interface Props {
  open: boolean;
  profile?: { name?: string | null; isTest?: boolean | null } | null;
  defaultIsTest?: boolean;
  readOnly?: boolean;
  confirmLoading?: boolean;
  onCancel: () => void;
  onSubmit: (values: ProfileFormValues) => void;
}

const ProfileFormModal = ({
  open,
  profile,
  defaultIsTest,
  readOnly = false,
  confirmLoading,
  onCancel,
  onSubmit,
}: Props) => {
  const [form] = Form.useForm<ProfileFormValues>();

  useEffect(() => {
    if (!open) return;
    if (profile) {
      form.setFieldsValue({
        name: profile.name ?? '',
        isTest: profile.isTest ?? false,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ isTest: defaultIsTest ?? false });
    }
  }, [open, profile, defaultIsTest, form]);

  const getTitle = () => {
    if (!profile) return 'Add Profile';
    return readOnly ? 'Profile' : 'Edit Profile';
  };

  return (
    <Modal
      title={getTitle()}
      open={open}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      onOk={() => form.validateFields().then(onSubmit)}
      destroyOnHidden
      footer={
        readOnly ? () => <Button onClick={onCancel}>Close</Button> : undefined
      }
    >
      <Form form={form} layout="vertical" disabled={readOnly}>
        <Form.Item
          name="name"
          label="Name"
          rules={[
            { required: true, whitespace: true, message: 'Name is required' },
          ]}
        >
          <Input placeholder="Full name" />
        </Form.Item>
        <Form.Item
          name="isTest"
          label="Test profile"
          valuePropName="checked"
          extra="Test profiles are used for channel calibration. Whether they trigger alerts is set in the security server's Configuration."
        >
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProfileFormModal;
