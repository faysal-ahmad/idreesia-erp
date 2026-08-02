import React from "react";
import { noop } from "lodash";
import { CloseCircleOutlined } from '@ant-design/icons';

import { Button, Form, Row } from "antd";

interface Props {
  handleClose?(): void;
}

const buttonItemLayout = {
  wrapperCol: { span: 16, offset: 4 },
};

/**
 * handleClose: Function to run when close button is pressed.
 */
const FormButtonsClose = ({ handleClose = noop }: Props) => (
  <Form.Item {...buttonItemLayout}>
    <Row justify="end">
      <Button
        size="large"
        type="default"
        icon={<CloseCircleOutlined />}
        onClick={handleClose}
      >
        Close
      </Button>
    </Row>
  </Form.Item>
);

export default FormButtonsClose;
