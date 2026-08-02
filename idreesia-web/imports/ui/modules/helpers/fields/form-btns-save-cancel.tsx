import React from 'react';
import { noop } from 'lodash';
import { CloseCircleOutlined, SaveOutlined } from '@ant-design/icons';

import { Button, Form, Space } from 'antd';

interface Props {
  handleCancel?(): void;
  isFieldsTouched?: boolean;
  /** Align buttons to the full form width (e.g. under full-width section cards). */
  fullWidth?: boolean;
}

const buttonItemLayout = {
  wrapperCol: { span: 16, offset: 4 },
};

const fullWidthButtonLayout = {
  wrapperCol: { span: 24 },
};

/**
 * handleCancel: Function to run when cancel button is pressed.
 */
const FormButtonsSaveCancel = ({
  handleCancel = noop,
  isFieldsTouched,
  fullWidth = false,
}: Props) => (
  <Form.Item
    {...(fullWidth ? fullWidthButtonLayout : buttonItemLayout)}
    style={fullWidth ? { marginBottom: 0 } : undefined}
  >
    <Space size={8} style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Button
        size="large"
        type="default"
        icon={<CloseCircleOutlined />}
        onClick={handleCancel}
      >
        Cancel
      </Button>
      <Button
        size="large"
        type="primary"
        icon={<SaveOutlined />}
        htmlType="submit"
        disabled={!isFieldsTouched}
      >
        Save
      </Button>
    </Space>
  </Form.Item>
);

export default FormButtonsSaveCancel;
