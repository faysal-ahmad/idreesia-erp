import React from "react";
import PropTypes from "prop-types";
import { Button, Form, Row } from "antd";
import { noop } from "lodash";

const buttonItemLayout = {
  wrapperCol: { span: 14, offset: 4 },
};

/**
 * handleClose: Function to run when close button is pressed.
 */
const FormButtonsClose = ({ handleClose }) => (
  <Form.Item {...buttonItemLayout}>
    <Row type="flex" justify="end">
      <Button type="default" onClick={handleClose}>
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
