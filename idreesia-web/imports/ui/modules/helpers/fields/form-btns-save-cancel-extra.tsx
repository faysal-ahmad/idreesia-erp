import React from 'react';
import { CloseCircleOutlined, SaveOutlined } from '@ant-design/icons';

import { noop } from 'meteor/idreesia-common/utilities/lodash';
import { Button, Col, Form, Row } from 'antd';

interface Props {
  allowSubmit?: boolean;
  extraText?: string;
  handleExtra?(): void;
  handleCancel?(): void;
  itemLayout?: Record<string, unknown>;
  isFieldsTouched?: boolean;
}

const buttonItemLayout = {
  wrapperCol: { span: 20, offset: 0 },
};

/**
 * handleCancel: Function to run when cancel button is pressed.
 */
const FormButtonsSaveCancelExtra = ({
  allowSubmit = true,
  extraText,
  handleExtra = noop,
  handleCancel = noop,
  itemLayout = buttonItemLayout,
  isFieldsTouched,
}: Props) => (
  <Form.Item {...itemLayout}>
    <Row justify="space-between">
      <Col>
        <Button size="large" type="default" onClick={handleExtra}>
          {extraText}
        </Button>
      </Col>
      <Col>
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
          disabled={!allowSubmit || !isFieldsTouched}
        >
          Save
        </Button>
      </Col>
    </Row>
  </Form.Item>
);

export default FormButtonsSaveCancelExtra;
