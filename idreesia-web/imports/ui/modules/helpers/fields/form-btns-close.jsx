import React from "react";
import PropTypes from "prop-types";
import { noop } from "lodash";
import { CloseCircleOutlined } from '@ant-design/icons';

import { Button, Form, Row } from "antd";

const buttonItemLayout = {
  wrapperCol: { span: 16, offset: 4 },
};

/**
 * handleClose: Function to run when close button is pressed.
 */
const FormButtonsClose = ({ handleClose }) => (
  <Form.Item {...buttonItemLayout}>
    <Row type="flex" justify="end">
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

FormButtonsClose.propTypes = {
  handleClose: PropTypes.func,
};

FormButtonsClose.defaultProps = {
  handleClose: noop,
};

export default FormButtonsClose;
