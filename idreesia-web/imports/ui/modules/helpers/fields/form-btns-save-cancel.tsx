import React from 'react';
import { noop } from 'lodash';
import { CloseCircleOutlined, SaveOutlined } from '@ant-design/icons';

import { Button, Form, Row } from 'antd';

interface Props {
  handleCancel?(): void;
  isFieldsTouched?: boolean;
}

const buttonItemLayout = {
  wrapperCol: { span: 16, offset: 4 },
};

/**
 * handleCancel: Function to run when cancel button is pressed.
 */
const FormButtonsSaveCancel = ({ handleCancel = noop, isFieldsTouched }: Props) => (
  <Form.Item {...buttonItemLayout}>
    <Row justify="end">
      <Button
        size="large"
        type="default"
        icon={<CloseCircleOutlined />}
        onClick={handleCancel}
      >
        Cancel
      </Button>
      &nbsp;
      <Button
        size="large"
        type="primary"
        icon={<SaveOutlined />}
        htmlType="submit"
        disabled={!isFieldsTouched}
      >
        Save
      </Button>
    </Row>
  </Form.Item>
);

export default FormButtonsSaveCancel;
