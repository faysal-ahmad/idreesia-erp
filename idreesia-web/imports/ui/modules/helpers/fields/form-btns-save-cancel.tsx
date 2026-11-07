import React from 'react';
import { noop } from 'lodash';
import { CloseCircleOutlined, SaveOutlined } from '@ant-design/icons';

import { Button, Flex, Form, Space } from 'antd';

interface Props {
  handleCancel?(): void;
  isFieldsTouched?: boolean;
  /** Align buttons to the full form width (e.g. under full-width section cards). */
  fullWidth?: boolean;
  /** Hide the Save button, leaving only Cancel. */
  hideSave?: boolean;
  /** Extra content shown at the left end of the row (e.g. a page action). */
  extra?: React.ReactNode;
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
  hideSave = false,
  extra,
}: Props) => {
  const buttons = (
    <Space size={8} style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Button
        size="large"
        type="default"
        icon={<CloseCircleOutlined />}
        onClick={handleCancel}
      >
        Cancel
      </Button>
      {hideSave ? null : (
        <Button
          size="large"
          type="primary"
          icon={<SaveOutlined />}
          htmlType="submit"
          disabled={!isFieldsTouched}
        >
          Save
        </Button>
      )}
    </Space>
  );

  return (
    <Form.Item
      {...(fullWidth ? fullWidthButtonLayout : buttonItemLayout)}
      style={fullWidth ? { marginBottom: 0 } : undefined}
    >
      {extra ? (
        <Flex justify="space-between" align="center" gap={8}>
          <div>{extra}</div>
          {buttons}
        </Flex>
      ) : (
        buttons
      )}
    </Form.Item>
  );
};

export default FormButtonsSaveCancel;
