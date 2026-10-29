import React, { useEffect } from 'react';
import {
  Button,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Space,
} from 'antd';

import type { AllSecurityServerChannelsQuery } from 'meteor/idreesia-common/types/client-operations';

export type Channel = NonNullable<
  NonNullable<
    AllSecurityServerChannelsQuery['allSecurityServerChannels']
  >[number]
>;

export interface ChannelFormValues {
  name: string;
  enabled: boolean;
  host: string;
  port: number;
  path?: string;
  username?: string;
  password?: string;
  similarityThreshold?: number | null;
  recognitionFps?: number;
  minFaceSizePx?: number | null;
  minFaceQuality?: number | null;
}

// Only set on edit, once the channel is running; a new channel starts here.
const DEFAULT_RECOGNITION_FPS = 5;

/** Maps the form values onto the channel mutations' variables. */
export const toChannelVariables = (values: ChannelFormValues) => ({
  name: values.name,
  enabled: values.enabled,
  // A cleared threshold or minimum is sent as null, which resets it to the
  // security server's default.
  similarityThreshold: values.similarityThreshold ?? null,
  recognitionFps: values.recognitionFps ?? DEFAULT_RECOGNITION_FPS,
  minFaceSizePx: values.minFaceSizePx ?? null,
  minFaceQuality: values.minFaceQuality ?? null,
  connection: {
    host: values.host,
    port: values.port ?? null,
    path: values.path || null,
    username: values.username || null,
    // Empty keeps the stored password.
    password: values.password || null,
  },
});

/** The form values of a stored channel, with the password left blank. */
export const toChannelFormValues = (channel: Channel): ChannelFormValues => ({
  name: channel.name ?? '',
  enabled: channel.enabled ?? false,
  host: channel.connection?.host ?? '',
  port: channel.connection?.port ?? 554,
  path: channel.connection?.path ?? undefined,
  username: channel.connection?.username ?? undefined,
  similarityThreshold: channel.similarityThreshold,
  recognitionFps: channel.recognitionFps ?? DEFAULT_RECOGNITION_FPS,
  minFaceSizePx: channel.minFaceSizePx,
  minFaceQuality: channel.minFaceQuality,
});

interface Props {
  open: boolean;
  channel?: Channel | null;
  readOnly?: boolean;
  confirmLoading?: boolean;
  togglingEnabled?: boolean;
  onCancel: () => void;
  onSubmit: (values: ChannelFormValues) => void;
  onToggleEnabled: (channel: Channel, enabled: boolean) => void;
}

const ChannelFormModal = ({
  open,
  channel,
  readOnly = false,
  confirmLoading,
  togglingEnabled,
  onCancel,
  onSubmit,
  onToggleEnabled,
}: Props) => {
  const [form] = Form.useForm<ChannelFormValues>();
  const enabled = Form.useWatch('enabled', form);

  useEffect(() => {
    if (!open) return;
    if (channel) {
      form.setFieldsValue(toChannelFormValues(channel));
    } else {
      form.resetFields();
      form.setFieldsValue({ enabled: true, port: 554 });
    }
  }, [open, channel, form]);

  const getTitle = () => {
    if (!channel) return 'Add Channel';
    return readOnly ? 'Channel' : 'Edit Channel';
  };

  const getFooter = (
    _: React.ReactNode,
    { OkBtn, CancelBtn }: { OkBtn: React.FC; CancelBtn: React.FC }
  ) => {
    if (readOnly) {
      return <Button onClick={onCancel}>Close</Button>;
    }
    if (!channel) {
      return (
        <Space>
          <CancelBtn />
          <OkBtn />
        </Space>
      );
    }
    return (
      <div className="security-server-modal-footer">
        <Popconfirm
          title={enabled ? 'Disable this channel?' : 'Enable this channel?'}
          onConfirm={() => {
            form.setFieldValue('enabled', !enabled);
            onToggleEnabled(channel, !enabled);
          }}
        >
          <Button loading={togglingEnabled}>
            {enabled ? 'Disable' : 'Enable'}
          </Button>
        </Popconfirm>
        <Space>
          <CancelBtn />
          <OkBtn />
        </Space>
      </div>
    );
  };

  return (
    <Modal
      title={getTitle()}
      open={open}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      onOk={() => form.validateFields().then(onSubmit)}
      destroyOnHidden
      width={640}
      footer={getFooter}
    >
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ span: 7 }}
        wrapperCol={{ span: 17 }}
        disabled={readOnly}
      >
        <Form.Item name="enabled" noStyle>
          <Input type="hidden" />
        </Form.Item>
        <Form.Item
          name="name"
          label="Name"
          rules={[
            { required: true, whitespace: true, message: 'Name is required' },
          ]}
        >
          <Input placeholder="e.g. Front door camera" />
        </Form.Item>
        <Form.Item
          name="host"
          label="Host"
          rules={[
            { required: true, whitespace: true, message: 'Host is required' },
          ]}
        >
          <Input placeholder="192.168.1.50" />
        </Form.Item>
        <Form.Item name="port" label="Port" rules={[{ required: true }]}>
          <InputNumber min={1} max={65535} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="path" label="Path">
          <Input placeholder="/stream1" />
        </Form.Item>
        <Form.Item name="username" label="Username">
          <Input autoComplete="off" />
        </Form.Item>
        {readOnly ? null : (
          <Form.Item name="password" label="Password">
            <Input.Password
              autoComplete="new-password"
              placeholder={
                channel?.connection?.hasPassword
                  ? 'Leave blank to keep current'
                  : ''
              }
            />
          </Form.Item>
        )}

        {/* Edit only: tuned once a channel is running (e.g. a threshold needs measured scores). */}
        {channel ? (
          <>
            <Divider />
            <Form.Item
              name="recognitionFps"
              label="Recognition rate (fps)"
              rules={[
                { required: true, message: 'Recognition rate is required' },
              ]}
              extra="Frames per second analyzed for faces. Higher catches people passing quickly but uses more CPU."
            >
              <InputNumber
                min={0.1}
                max={30}
                step={1}
                style={{ width: '100%' }}
              />
            </Form.Item>
            <Form.Item
              name="similarityThreshold"
              label="Similarity threshold"
              extra="Minimum cosine similarity for a face on this channel to raise an alert. Leave blank to use the security server's default."
            >
              <InputNumber
                min={0}
                max={1}
                step={0.01}
                placeholder="Default"
                style={{ width: '100%' }}
              />
            </Form.Item>
            <Form.Item
              name="minFaceSizePx"
              label="Min face size (px)"
              extra="Faces smaller than this (in the camera's own pixels) are ignored. Lower catches people further away but uses more CPU. Leave blank for the security server's default, or 0 to turn the check off."
            >
              <InputNumber
                min={0}
                max={2000}
                step={8}
                precision={0}
                placeholder="Default"
                style={{ width: '100%' }}
              />
            </Form.Item>
            <Form.Item
              name="minFaceQuality"
              label="Min face quality"
              extra="Faces scoring below this (0-100: blur, angle, lighting, size) are ignored. Leave blank for the security server's default, or 0 to turn the check off."
            >
              <InputNumber
                min={0}
                max={100}
                step={5}
                precision={0}
                placeholder="Default"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </>
        ) : null}
      </Form>
    </Modal>
  );
};

export default ChannelFormModal;
